import {
  ICommandOptions,
  IParamDecoratorMetadata,
  IReceiverOptions,
  isString,
  TReceiver,
} from "@watsonjs/common";
import { Message } from "discord.js";

import { IMethodValue, InstanceWrapper } from "../../injector";
import { IAsynchronousResolvable } from "../../interfaces";
import { WatsonContainer } from "../../watson-container";
import { EventRoute } from "../event-route";
import { CommandConfiguration } from "./command-config";
import { CommandParser } from "./command-parser";

export interface ICommandParams {
  [name: string]: unknown;
}

export interface IParamDecorator extends IParamDecoratorMetadata {}

export class CommandRoute extends EventRoute<"message"> {
  public readonly config: CommandConfiguration;
  public readonly handler: Function;
  public readonly host: InstanceWrapper<TReceiver>;
  private readonly parser: CommandParser;

  private readonly acknowledgementReaction: string;

  constructor(
    commandOptions: ICommandOptions,
    receiverOptions: IReceiverOptions,
    receiver: InstanceWrapper<TReceiver>,
    handler: IMethodValue,
    container: WatsonContainer
  ) {
    super("command", container);

    this.config = new CommandConfiguration(
      commandOptions,
      receiverOptions,
      container.config,
      handler
    );

    this.handler = handler.descriptor;
    this.host = receiver;
    this.acknowledgementReaction = this.container.config.acknowledgementReaction;
    this.parser = new CommandParser(this.config);
  }

  public matchEvent(message: [Message]): IAsynchronousResolvable<boolean> {
    const { content } = message[0];
    const { command } = this.parser.extractMessageParts(content);

    const matches =
      this.parser.matchesPrefix(content) && this.parser.matchesCommand(command);

    if (!matches) {
      return false;
    }

    if (isString(this.acknowledgementReaction)) {
      message[0].react(this.acknowledgementReaction);
    }

    return true;
  }

  public get name() {
    return this.config.name;
  }

  public get params() {
    return this.config.params || [];
  }

  public get prefix() {
    return this.config.prefix || "";
  }

  public createContextData(message: any) {
    if (Array.isArray(message)) {
      [message] = message;
    }

    return this.parser.parse(message);
  }
}
