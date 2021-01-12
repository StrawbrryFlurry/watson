import {
  BadArgumentException,
  CommandArgumentType,
  CommandContextData,
  ICommandOptions,
  ICommandParam,
  IParamDecoratorMetadata,
  IReceiverOptions,
  TReceiver,
  UnatuhorizedException,
} from '@watson/common';
import * as dayjs from 'dayjs';
import { Message } from 'discord.js';
import { EventRoute } from 'event';
import { IAsynchronousResolvable } from 'interfaces';
import { CommandExecutionContext } from 'lifecycle';

import { IMethodValue, InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { CommandConfiguration } from './command-config';
import { CommandParser } from './command-parser';

export interface ICommandParams {
  [name: string]: unknown;
}

export interface IParamDecorator extends IParamDecoratorMetadata {}

export class CommandRoute extends EventRoute<"message"> {
  public readonly config: CommandConfiguration;
  public readonly handler: Function;
  public readonly host: InstanceWrapper<TReceiver>;
  private readonly parser = new CommandParser();

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
  }

  public matchEvent(eventArgs: Message): IAsynchronousResolvable<boolean> {
    throw new Error("Method not implemented.");
  }

  public createContextData(...eventArgs: unknown[]): CommandContextData {
    throw new Error("Method not implemented.");
  }
}

export class _CommandRoute extends CommandConfiguration {
  public host: InstanceWrapper<TReceiver>;
  public descriptor: Function;
  public routeArgs: IParamDecorator[];
  private container: WatsonContainer;

  constructor(
    method: IMethodValue,
    receiverOptions: IReceiverOptions,
    commandOptions: ICommandOptions,
    routeArgs: IParamDecorator[],
    receiver: InstanceWrapper<TReceiver>,
    container: WatsonContainer
  ) {
    super(commandOptions, receiverOptions, container.config, method);

    this.routeArgs = routeArgs;
    this.descriptor = method.descriptor;
    this.host = receiver;
    this.container = container;
  }

  public matchesMessage(message: Message) {
    if (message.channel.type === "dm") {
      if (this.directMessage === false) {
        return false;
      }
    }

    try {
      const { command } = this.extractMessageData(message);

      if (!this.includesCommandName(command)) {
        return false;
      }

      if (!this.matchesChannel(message)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private includesCommandName(command: string) {
    if (this.caseSensitive === true) {
      command = command.toLowerCase();

      if (this.name.toLowerCase() === command) {
        return true;
      }

      return this.alias.some((c) => c.toLowerCase() === command);
    }

    if (this.name === command) {
      return true;
    }

    return this.alias.some((c) => c === command);
  }

  private extractMessageData(message: Message) {
    let messageContent = message.content;

    if (!messageContent.startsWith(this.prefix)) {
      return undefined;
    }

    messageContent = messageContent.replace(this.prefix, "");
    const [command, ...params] = messageContent.split(" ");

    return {
      command,
      prams: params.join(" "),
      prefix: this.prefix,
    };
  }

  public async checkAndParse(ctx: CommandExecutionContext) {
    this.checkRestrictions(ctx);
    return await this.getParamsFromMessage(ctx);
  }

  public getContainer() {
    return this.container;
  }

  private checkRestrictions(ctx: CommandExecutionContext) {
    if (!this.hasPermissions(ctx)) {
      throw new UnatuhorizedException("Permission");
    }

    if (!this.hasRoles(ctx)) {
      throw new UnatuhorizedException("Role");
    }

    return true;
  }

  private async getParamsFromMessage(
    ctx: CommandExecutionContext
  ): Promise<ICommandParams> {
    if (!this.hasParams) {
      return null;
    }

    const { prams: paramString } = this.extractMessageData(ctx.message);

    if (this.useRegex) {
      return { regex: paramString.split(this.paramRegex) };
    }

    let params = [];

    if (this.hasSentence) {
      params = this.parseParamSentece(paramString);
    }

    const remainingParams = paramString.split(this.paramDelimiter);

    const paramsMap = await Promise.all(
      this.params.map(async (param, idx) => {
        if (typeof params[idx] !== "undefined") {
          return { [param.name]: params[idx] };
        }

        const parsedParam = await this.parseParamType(
          ctx,
          remainingParams[idx],
          param
        );

        return { [param.name]: parsedParam };
      })
    );

    return paramsMap.reduce((params, param) => {
      const [key, value] = Object.entries(param)[0];

      return Object.assign(params, { [key]: value });
    }, {}) as ICommandParams;
  }

  private parseParamType(
    ctx: CommandExecutionContext,
    value: string,
    param: ICommandParam
  ) {
    let result: unknown;

    if (!value && param.default) {
      value = param.default;
    }

    switch (param.type) {
      case CommandArgumentType.USER:
        try {
          const [match] = value.match(/^<@.*>$/);
          result = ctx.message.guild.members.fetch(ctx.message);
        } catch (err) {
          throw new BadArgumentException(param);
        }
        break;
      case CommandArgumentType.CHANNEL:
        break;
      case CommandArgumentType.ROLE:
        try {
          const [match] = value.match(/^<@&.*>$/);
          result = ctx.message.guild.roles.fetch(value);
        } catch {
          throw new BadArgumentException(param);
        }
        break;
      case CommandArgumentType.DATE:
        const format = param.dateFormat;
        const date = dayjs(value, format);

        if (date.isValid() === false) {
          throw new BadArgumentException(param);
        }

        result = date;
        break;
      case CommandArgumentType.NUMBER:
        const number = Number(value);

        if (number === NaN) {
          return undefined;
        }

        result = number;
        break;
      case CommandArgumentType.STRING:
        result = String(value);
        break;
    }

    return result;
  }

  private parseParamSentece(message: string) {
    const params = [];

    this.params.forEach((param, idx) => {
      if (param.type === CommandArgumentType.SENTENCE) {
        const regex = new RegExp(
          `${param.encapsulator}.*${param.encapsulator}`
        );
        try {
          const [messageMatch] = message.match(regex);
          const data = messageMatch.substring(1, messageMatch.length - 1);

          params[idx] = data;
        } catch {
          throw new BadArgumentException(param);
        }
      }
    });
    return params;
  }
}
