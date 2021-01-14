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
      case RouteParamType.CHANNEL:
        paramValue = ctx.channel;
        break;
      case RouteParamType.CLIENT:
        paramValue = ctx.client;
        break;
      case RouteParamType.CONTEXT:
        paramValue = ctx;
        break;
      case RouteParamType.GUILD:
        paramValue = ctx.guild || null;
        break;
      case RouteParamType.MESSAGE:
        paramValue = ctx.message;
        break;
      case RouteParamType.USER:
        paramValue = ctx.user;
        break;
      case RouteParamType.PARAM:
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
