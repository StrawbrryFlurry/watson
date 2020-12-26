import {
  BadArgumentException,
  CommandArgumentType,
  ICommandOptions,
  ICommandParam,
  IReceiverOptions,
  TReceiver,
  UnatuhorizedException,
} from '@watson/common';
import * as dayjs from 'dayjs';
import { Message } from 'discord.js';

import { IMethodValue, InstanceWrapper } from '../injector';
import { WatsonContainer } from '../watson-container';
import { CommandConfiguration } from './command-config';
import { CommandContext } from './command-context';

export interface ICommandParams {
  [name: string]: unknown;
}

export class CommandRoute extends CommandConfiguration {
  public configuration: CommandConfiguration;
  public host: InstanceWrapper<TReceiver>;
  public descriptor: Function;
  private container: WatsonContainer;

  constructor(
    method: IMethodValue,
    receiverOptions: IReceiverOptions,
    commandOptions: ICommandOptions,
    receiver: InstanceWrapper<TReceiver>,
    container: WatsonContainer
  ) {
    super(commandOptions, receiverOptions, container.config, method);

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

      return true;
    } catch {
      return false;
    }
  }

  public async checkAndParse(ctx: CommandContext) {
    this.checkRestrictions(ctx);
    return await this.getParamsFromMessage(ctx);
  }

  public getContainer() {
    return this.container;
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

    if (messageContent.startsWith(this.prefix)) {
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

  private checkRestrictions(ctx: CommandContext) {
    if (!this.hasPermissions(ctx)) {
      throw new UnatuhorizedException();
    }

    if (!this.hasRoles(ctx)) {
      throw new UnatuhorizedException();
    }

    if (!this.matchesChannel(ctx)) {
      throw new UnatuhorizedException();
    }

    return true;
  }

  private async getParamsFromMessage(
    ctx: CommandContext
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
    ctx: CommandContext,
    value: string,
    param: ICommandParam
  ) {
    let result: unknown;
    switch (param.type) {
      case CommandArgumentType.USER:
        try {
          const [match] = value.match(/^<@.*>$/);
          result = ctx.guild.members.fetch(ctx.message);
        } catch {
          throw new BadArgumentException("");
        }
        break;
      case CommandArgumentType.CHANNEL:
        break;
      case CommandArgumentType.ROLE:
        try {
          const [match] = value.match(/^<@&.*>$/);
          result = ctx.guild.roles.fetch(value);
        } catch {
          throw new BadArgumentException("");
        }
        break;
      case CommandArgumentType.DATE:
        const format = param.dateFormat;
        const date = dayjs(value, format);

        if (date.isValid() === false) {
          throw new BadArgumentException("");
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
          throw new BadArgumentException("");
        }
      }
    });
    return params;
  }
}
