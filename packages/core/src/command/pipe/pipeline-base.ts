import { ContextBindingFactory, ContextInjector, Injector } from '@core/di';
import { RouterRef } from '@core/router';
import { BaseRoute, ContextType, ExecutionContext, PipelineBase, PipelineWithGuildCtx } from '@watsonjs/common';
import { Snowflake } from 'discord.js';

export abstract class PipelineBaseImpl<
  D extends unknown,
  R extends BaseRoute = any
> implements PipelineBase
{
  public contextType: ContextType;
  public route: R;
  public router: RouterRef;
  protected _injector: Injector;
  protected _guildId: Snowflake;

  public get eventData(): D {
    return this._eventData;
  }

  private _eventData: D;

  constructor(route: R, type: ContextType, eventData: D) {
    this.route = route;
    this.contextType = type;
    this._eventData = eventData;
    this.router = route.host;
  }

  public getEvent(): D {
    return this._eventData;
  }

  public getInjector<T = Injector>(): T {
    return this._injector as any as T;
  }

  public isFromGuild(): this is PipelineBase<any, any> & PipelineWithGuildCtx {
    return !!this._guildId;
  }

  /**
   * Creates the `ExecutionContext` and
   * the `ContextInjector` for the current
   * pipeline.
   *
   * This function needs to call `createAndBindInjector`
   * cause the `ExecutionContext`, which acts as
   * the injector for any pipeline, needs a
   * Pipeline reference to be created.
   */
  protected abstract createExecutionContext(moduleInj: Injector): Promise<void>;

  /**
   * Creates the `ContextInjector` using
   * `bindingFactory` and binds the
   * `ExecutionContextRef` from `ContextInjector`
   * as the injector of this pipeline.
   */
  protected async createAndBindInjector(
    moduleInj: Injector,
    bindingFactory: ContextBindingFactory
  ) {
    const inj = new ContextInjector(moduleInj, this, bindingFactory);
    const ctx = await inj.get(ExecutionContext);
    this._injector = <Injector>ctx;
  }
}
