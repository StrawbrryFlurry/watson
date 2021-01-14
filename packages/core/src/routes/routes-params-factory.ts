import {
  CommandContextData,
  ContextData,
  ExecutionContext,
  IParamDecoratorMetadata,
  isFunction,
  isString,
  ParamFactoryFunction,
  RouteParamType,
} from '@watson/common';
import { AsyncContextResolver } from 'lifecycle';

export class RouteParamsFactory {
  private asyncResolver = new AsyncContextResolver();

  public async createFromContext(
    paramTypes: IParamDecoratorMetadata[],
    ctx: ExecutionContext
  ) {
    const data = ctx.getContextData<ContextData>();
    const params: unknown[] = [];

    for (const type of paramTypes) {
      const idx = type.paramIndex;
      switch (type.type) {
        case RouteParamType.CHANNEL:
          params[idx] = (data as CommandContextData).channel;
          break;
        case RouteParamType.CLIENT:
          params[idx] = data.client;
          break;
        case RouteParamType.CONTEXT:
          params[idx] = ctx;
          break;
        case RouteParamType.GUILD:
          params[idx] = data.guild;
          break;
        case RouteParamType.MESSAGE:
          params[idx] = data as CommandContextData;
          break;
        case RouteParamType.PARAM:
          const param = type.options;
          params[idx] = isString(param)
            ? (data as CommandContextData).params[param]
            : (data as CommandContextData).params;
          break;
        case RouteParamType.USER:
          params[idx] = (data as CommandContextData).user;
          break;
        case RouteParamType.FACTORY:
          param[idx] = await this.fromParamFactory(ctx, type.factory);
          break;
        default:
          param[idx] = undefined;
      }
    }

    return params;
  }

  public async fromParamFactory(
    ctx: ExecutionContext,
    factory: ParamFactoryFunction
  ) {
    if (isFunction(factory)) {
      return undefined;
    }

    const factoryResult = factory(ctx);
    return this.asyncResolver.resolveAsyncValue(factoryResult);
  }
}
