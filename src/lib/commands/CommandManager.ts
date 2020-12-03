import { cyan, white } from 'chalk';

import { getGlobalMetadataStorage, ICommandClassMetadata, ICommandHandleMetadata } from '../metadata';
import { log } from '../util';
import { IncommingMessage } from './IncommingMessage';
import { ICommandHandle, ICommandManagerOptions } from './interfaces';

export class CommandManager {
  private readonly commandHandles: ICommandHandle[] = [];
  private readonly metadataStorage = getGlobalMetadataStorage();
  private readonly prefixes: string[] = [];

  private get globalPrefix() {
    return this.options?.globalPrefix || null;
  }

  private get argumentDelimiter() {
    return this.options?.argumentDelimiter || " ";
  }

  constructor(private options?: ICommandManagerOptions) {}

  public handleIncomingMessage(message: IncommingMessage) {
    const prefix = message.includesPrefix(this.prefixes);

    if (!prefix) return;

    const commandName = message.getCommandName(prefix, this.argumentDelimiter);
    const command = this.commandHandles.find(
      (command) => command.commandName === commandName
    );

    if (!command) {
      // Command doesn't exist
      // Maybe send message to channel?
      return;
    }

    message.command = command;

    if (command.channel)
      if (
        !command.channel.includes(message.channelID) &&
        !command.channel.includes(message.getChannel()!.name)
      )
        return;

    if (!command.arguments || command.arguments.length === 0) {
      return command.handle(message);
    }

    const remainingMessage = message.getRemainingMessage(prefix, commandName);
    const args = remainingMessage.trim().split(this.argumentDelimiter);

    const missingArgument = command.arguments
      .map((arg) => {
        if (!args[arg.index]) return { arg, idx: arg.index };
        return null;
      })
      .find((e) => e !== null);

    if (missingArgument) {
      return message.message.channel.send(
        `Missing argument ${missingArgument.arg.name} at position ${
          missingArgument.idx
        } for command ${prefix + command.commandName}`
      );
    }

    message.arguments = args;
    return command.handle(message);
  }

  public loadCommands() {
    const commandClasses = this.metadataStorage.commandClasses;

    commandClasses.forEach((commandClass) =>
      this.metadataStorage
        .getCommandHanleByClass(commandClass.target)
        .forEach((handle) => this.registerCommand(commandClass, handle))
    );
  }

  private registerCommand(
    commandClass: ICommandClassMetadata,
    handle: ICommandHandleMetadata
  ) {
    let commandName = handle.options.name;
    let args = handle.options.arguments || null;
    let prefix =
      handle.options.prefix ||
      commandClass.options?.prefix ||
      this.globalPrefix;
    let channel =
      handle.options.channel || commandClass.options?.channel || null;

    if (typeof prefix === null || prefix === "")
      throw new Error(
        `Cannot register command ${commandName} without prefix. Either add a global prefix or specify it in the class decorator`
      );

    if (prefix && !this.prefixes.includes(prefix)) {
      log("CommandLoader", `Adding global prefix ${prefix}`);

      this.prefixes.push(prefix);
    }

    log(
      "CommandLoader",
      `Mapping command ${cyan(prefix)}${cyan(commandName)} with ${white(
        handle.propertyName
      )}`
    );

    this.commandHandles.push({
      _propertyName: handle.propertyName,
      _target: handle.target,
      commandName: commandName,
      arguments: args,
      handle: handle.descriptor.value,
      prefix: prefix,
      channel: channel,
    });
  }
}
