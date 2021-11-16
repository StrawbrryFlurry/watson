import { BaseRoute, ContextType, PipelineBase } from '@watsonjs/common';
import { Injector } from '@watsonjs/core';

export abstract class PipelineBaseImpl<
  T extends PipelineBase,
  R extends BaseRoute = any
> implements PipelineBase
{
  public contextType: ContextType;
  public route: R;
  protected _injector: Injector;

  constructor(
    route: R,
    injector: Injector,
    type: ContextType,
    private eventData: unknown
  ) {
    this.route = route;
    this._injector = injector;
    this.contextType = type;
  }

  public getEvent<T extends unknown = unknown[]>(): T {
    return this.eventData as T;
  }

  public getInjector<T = Injector>(): T {
    return this._injector as any as T;
  }
}
