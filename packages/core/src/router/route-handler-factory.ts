import { ContextPipelineFactory } from '@core/command';
import { ResponseController } from '@core/lifecycle';
import { RouteParamsFactory } from '@core/router';
import { RouterRef } from '@core/router/application-router';
import {
  FiltersConsumer,
  FiltersConsumerFn,
  GuardsConsumer,
  GuardsConsumerFn,
  PipesConsumer,
  PipesConsumerFn,
} from '@core/router/interceptors';
import { rethrowWithContext } from '@core/utils';
import { BaseRoute, CommandRoute, MessageMatchResult, RuntimeException } from '@watsonjs/common';
import { ComponentFactoryRef, resolveAsyncValue } from '@watsonjs/di';
import { Message } from 'discord.js';

/**
 * The handler function will be called by
 * the event proxy to invoke the watson lifecycle
 * when a registered event is fired.
 */
export type LifecycleFunction = (
  routeRef: BaseRoute,
  eventData: unknown[],
  ...args: unknown[]
) => Promise<void>;

interface InterceptorHandlers {
  applyGuards: GuardsConsumerFn;
  applyPipes: PipesConsumerFn;
  applyFilters: FiltersConsumerFn;
  // applyInterceptors: GuardsConsumer;
}

export class RouteHandlerFactory {
  private _paramsFactory = new RouteParamsFactory();
  private _responseController = new ResponseController();
  private _pipelineFactory = new ContextPipelineFactory();

  private _pipesConsumer = new PipesConsumer();
  private _guardsConsumer = new GuardsConsumer();
  private _filtersConsumer = new FiltersConsumer();

  public async createCommandHandler<RouteResult = any>(
    route: CommandRoute,
    handler: Function,
    routerRef: RouterRef
  ): Promise<LifecycleFunction> {
    const { applyFilters, applyGuards, applyPipes } = this._getInterceptors(
      routerRef,
      handler
    );

    const routerFactory = await routerRef.get(ComponentFactoryRef);
    const paramsFactory = this._paramsFactory.create(route);

    const cb: LifecycleFunction = async (
      route: CommandRoute,
      event: [Message],
      matchResult: MessageMatchResult
    ) => {
      const [message] = event;
      const pipelineRef = await this._pipelineFactory.create(
        route,
        routerRef,
        message,
        matchResult
      );

      const { ctx } = pipelineRef;

      try {
        const didPass = await applyFilters(ctx);

        if (didPass !== true) {
          return;
        }

        await applyGuards(ctx);
        await applyPipes(ctx);

        const params = await paramsFactory(ctx);
        const routerInstance = await routerFactory.create(null, ctx);
        const resolvable = handler.apply(routerInstance, params);
        const result: RouteResult = await resolveAsyncValue(resolvable);

        await this._responseController.apply(ctx, result);
      } catch (err) {
        if (err instanceof RuntimeException) {
          rethrowWithContext(err, ctx);
        } else {
          throw err;
        }
      }
    };

    return cb;
  }

  public async createApplicationCommandHandler(): Promise<LifecycleFunction> {
    return null as any;
  }

  public async createEventHandler(): Promise<LifecycleFunction> {
    return null as any;
  }

  private _getInterceptors(
    routerRef: RouterRef,
    handler: Function
  ): InterceptorHandlers {
    const applyFilters = this._filtersConsumer.create(routerRef, handler);
    const applyGuards = this._guardsConsumer.create(routerRef, handler);
    const applyPipes = this._pipesConsumer.create(routerRef, handler);

    return {
      applyFilters,
      applyGuards,
      applyPipes,
    };
  }
}
