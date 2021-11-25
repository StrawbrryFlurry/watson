import { BaseRoute, ContextType, ExecutionContext, PipelineBase } from '@watsonjs/common';
import { Injector } from '@watsonjs/core';

export abstract class PipelineBaseImpl<
  D extends unknown,
  R extends BaseRoute = any
> implements PipelineBase
{
  public contextType: ContextType;
  public route: R;
  protected abstract _injector: Injector;

  public get eventData(): D {
    return this._eventData;
  }

  private _eventData: D;

  constructor(route: R, type: ContextType, eventData: D) {
    this.route = route;
    this.contextType = type;
    this._eventData = eventData;
  }

  public getEvent(): D {
    return this._eventData;
  }

  public getInjector<T = Injector>(): T {
    return this._injector as any as T;
  }

  protected abstract createExecutionContext(
    moduleInj: Injector,
    eventData: D
  ): Promise<ExecutionContext>;
}
