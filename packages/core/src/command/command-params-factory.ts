import { CommandParam } from '@watson/common';

import { AsyncContextResolver, CommandExecutionContext } from '../lifecycle';

export class CommandParamsFactory {
  private asyncResolver = new AsyncContextResolver();

  public getParamFromContext(
    ctx: CommandExecutionContext,
    param: CommandParam,
    options: unknown
  ) {
    let paramValue: unknown;
    switch (param) {
      case CommandParam.CHANNEL:
        paramValue = ctx.channel;
        break;
      case CommandParam.CLIENT:
        paramValue = ctx.client;
        break;
      case CommandParam.CONTEXT:
        paramValue = ctx;
        break;
      case CommandParam.GUILD:
        paramValue = ctx.guild || null;
        break;
      case CommandParam.MESSAGE:
        paramValue = ctx.message;
        break;
      case CommandParam.USER:
        paramValue = ctx.user;
        break;
      case CommandParam.PARAM:
        paramValue =
          options === undefined ? ctx.params : ctx.params[options as string];
        break;
      default:
        paramValue = null;
    }

    return paramValue;
  }

  public resolvePramFactory(factory: Function) {
    return this.asyncResolver.resolveAsyncValue(factory);
  }
}
