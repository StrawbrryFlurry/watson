import {
  CanActivate,
  CommandContextData,
  ContextDataTypes,
  ContextEventTypes,
  EventContextData,
  ExecutionContext,
  Filter,
  FILTER_METADATA,
  GUARD_METADATA,
  IParamDecoratorMetadata,
  isEmpty,
  isFunction,
  PARAM_METADATA,
  PipeTransform,
  SlashContextData,
  TReceiver,
  UnatuhorizedException,
} from '@watson/common';
import { Base } from 'discord.js';
import { EventExecutionContext } from 'event/event-execution-context';
import { ModuleInitException } from 'exceptions';
import { rethrowWithContext } from 'helpers/rethrow-with-context';
import { InstanceWrapper, Module } from 'injector';
import { badChangeableImplementation, changeableNotFound } from 'logger';
import { CommandRoute, EventRoute, RouteParamsFactory } from 'routes';
import { WatsonContainer } from 'watson-container';

import { AsyncContextResolver } from '../lifecycle/async-context-resolver';
import { ResponseController } from '../lifecycle/response-controller';

export type IContextFactory<CT extends ContextDataTypes, A = any> = (
  ...eventData: A[]
) => Promise<void>;

export class RouteContextFactory {
  private paramsFactory: RouteParamsFactory;
  private responseController = new ResponseController();
  private asyncResolver = new AsyncContextResolver();

  constructor(private container: WatsonContainer) {}

  public async createCommandContext(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IContextFactory<CommandContextData>> {
    const { filters, guards, paramsFactory, pipes } = this.getMetadata(
      route,
      handle,
      receiver,
      module
    );

    const applyPipesFn = this.createPipesFn(pipes);
    const applyFilterFn = this.createFiltersFn(filters);
    const applyGuardsFn = this.createGuardsFn(guards);

    return this.createHandlerFn({
      type: "command",
      handle: handle,
      paramsFactory: paramsFactory,
      receiver: receiver,
      route: route,
      applyFilterFn,
      applyGuardsFn,
      applyPipesFn,
    });
  }

  public async createSlashContext(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IContextFactory<SlashContextData>> {
    const { filters, guards, paramsFactory, pipes } = this.getMetadata(
      route,
      handle,
      receiver,
      module
    );

    const applyPipesFn = this.createPipesFn(pipes);
    const applyFilterFn = this.createFiltersFn(filters);
    const applyGuardsFn = this.createGuardsFn(guards);

    return this.createHandlerFn({
      type: "slash",
      handle: handle,
      paramsFactory: paramsFactory,
      receiver: receiver,
      route: route,
      applyFilterFn,
      applyGuardsFn,
      applyPipesFn,
    });
  }

  public async createEventContext(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IContextFactory<EventContextData>> {
    const { filters, paramsFactory, pipes } = this.getMetadata(
      route,
      handle,
      receiver,
      module
    );

    const applyPipesFn = this.createPipesFn(pipes);
    const applyFilterFn = this.createFiltersFn(filters);

    return this.createHandlerFn({
      type: "event",
      handle: handle,
      paramsFactory: paramsFactory,
      receiver: receiver,
      route: route,
      applyFilterFn,
      applyPipesFn,
    });
  }

  private reflectGuards(
    handler: Function,
    receiver: InstanceWrapper<TReceiver>
  ) {
    const { host: module } = receiver;

    const guards = this.reflectKey<CanActivate>(
      GUARD_METADATA,
      handler,
      receiver
    );

    let resolvedGuards: CanActivate[] = [];

    const checkActivate = (guard: CanActivate) => {
      if (typeof guard.canActivate === "undefined") {
        throw new ModuleInitException(
          badChangeableImplementation(
            "guard",
            (guard as any).name,
            handler,
            receiver,
            module
          )
        );
      }
    };

    for (const guard of guards) {
      if (isFunction(guard)) {
        const wrapper = module.injectables.get((guard as Function).name);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            changeableNotFound(
              "guard",
              (guard as Function).name,
              handler,
              receiver,
              module
            )
          );
        }

        checkActivate(wrapper.instance as CanActivate);
        resolvedGuards.push(wrapper.instance as CanActivate);
      } else {
        checkActivate(guard as CanActivate);
        resolvedGuards.push(guard as CanActivate);
      }
    }

    return resolvedGuards;
  }

  public createGuardsFn(guards: CanActivate[]) {
    if (isEmpty(guards)) {
      return null;
    }

    return async (ctx: ExecutionContext) => {
      for (const guard of guards) {
        const res = guard.canActivate(ctx);
        const activationRes = await this.asyncResolver.resolveAsyncValue<
          boolean,
          boolean
        >(res);

        if (activationRes) {
          throw new UnatuhorizedException(ctx);
        }
      }
    };
  }

  private reflectFilters(
    handler: Function,
    receiver: InstanceWrapper<TReceiver>
  ) {
    const { host: module } = receiver;

    const filters = this.reflectKey<Filter>(FILTER_METADATA, handler, receiver);

    let resolvedFilters: Filter[] = [];

    const checkFilter = (filter: Filter) => {
      if (typeof filter.filter === "undefined") {
        throw new ModuleInitException(
          badChangeableImplementation(
            "filter",
            (filter as any).name,
            handler,
            receiver,
            module
          )
        );
      }
    };

    for (const filter of filters) {
      if (isFunction(filter)) {
        const wrapper = module.injectables.get((filter as Function).name);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            changeableNotFound(
              "filter",
              (filter as Function).name,
              handler,
              receiver,
              module
            )
          );
        }

        checkFilter(wrapper.instance as Filter);
        resolvedFilters.push(wrapper.instance as Filter);
      } else {
        checkFilter(filter as Filter);
        resolvedFilters.push(filter as Filter);
      }
    }

    return resolvedFilters;
  }

  public createFiltersFn(filters: Filter[]) {
    if (isEmpty(filters)) {
      return null;
    }

    return async (ctx: ExecutionContext) => {
      for (const filter of filters) {
        const res = filter.filter(ctx);
        const filterResult = await this.asyncResolver.resolveAsyncValue<
          boolean,
          boolean
        >(res);

        if (filterResult) {
          continue;
        } else {
          return false;
        }
      }

      return true;
    };
  }

  private reflectPipes(
    handler: Function,
    receiver: InstanceWrapper<TReceiver>
  ) {
    const { host: module } = receiver;

    const pipes = this.reflectKey<PipeTransform>(
      FILTER_METADATA,
      handler,
      receiver
    );

    let resolvedPipes: PipeTransform[] = [];

    const checkTransform = (pipe: PipeTransform) => {
      if (typeof pipe.transform === "undefined") {
        throw new ModuleInitException(
          badChangeableImplementation(
            "pipe",
            (pipe as any).name,
            handler,
            receiver,
            module
          )
        );
      }
    };

    for (const pipe of pipes) {
      if (isFunction(pipe)) {
        const wrapper = module.injectables.get((pipe as Function).name);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            changeableNotFound(
              "pipe",
              (pipe as Function).name,
              handler,
              receiver,
              module
            )
          );
        }

        checkTransform(wrapper.instance as PipeTransform);
        resolvedPipes.push(wrapper.instance as PipeTransform);
      } else {
        checkTransform(pipe as PipeTransform);
        resolvedPipes.push(pipe as PipeTransform);
      }
    }

    return resolvedPipes;
  }

  private createPipesFn(pipes: PipeTransform[]) {
    if (isEmpty(pipes)) {
      return null;
    }

    return async (
      ctx: CommandContextData | SlashContextData | EventContextData
    ) => {
      const transformStack = [ctx];
      for (const pipe of pipes) {
        const currentCtx = transformStack[-1];
        const res = pipe.transform(currentCtx);
        const transformedCtx = await this.asyncResolver.resolveAsyncValue(res);

        transformStack.push(transformedCtx);
      }

      return transformStack[-1];
    };
  }

  private reflectKey<T>(
    metadataKey: string,
    handler: Function,
    receiver: InstanceWrapper<TReceiver>
  ) {
    const { metatype } = receiver;

    const handlerMetadata: (T | Function)[] =
      Reflect.getMetadata(metadataKey, handler) || [];

    const receiverMetadata: (T | Function)[] =
      Reflect.getMetadata(metadataKey, metatype) || [];

    const allGuards = [...receiverMetadata, ...handlerMetadata];
    const filteredGuards = [...new Set(allGuards)];

    return filteredGuards;
  }

  private getMetadata(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ) {
    const guards = this.reflectGuards(handle, receiver);
    const filters = this.reflectFilters(handle, receiver);
    const pipes = this.reflectPipes(handle, receiver);

    const params = this.reflectParams(handle);

    const paramsFactory = (ctx: ExecutionContext) => {
      return this.paramsFactory.createFromContext(params, ctx);
    };

    return {
      guards,
      filters,
      pipes,
      paramsFactory,
    };
  }

  private createHandlerFn<RouteResult = any>({
    applyFilterFn,
    applyGuardsFn,
    applyPipesFn,
    paramsFactory,
    handle,
    receiver,
    type,
    route,
  }: {
    applyPipesFn?: (ctx: ContextDataTypes) => Promise<any>;
    applyGuardsFn?: (ctx: ExecutionContext) => Promise<void>;
    applyFilterFn?: (ctx: ExecutionContext) => Promise<boolean>;
    paramsFactory: (ctx: ExecutionContext) => Promise<unknown[]>;
    receiver: InstanceWrapper<TReceiver>;
    handle: Function;
    type: ContextEventTypes;
    route: EventRoute<any>;
  }) {
    return async (event: Base[]) => {
      const matches = route.matchEvent(event);

      if (!matches) {
        return null;
      }

      const ctx = new EventExecutionContext(type, event, route, this.container);

      try {
        const data = await route.createContextData(event);
        ctx.applyTransformation(data);

        const compliesFilter = applyFilterFn && (await applyFilterFn(ctx));

        if (applyFilterFn !== undefined && !compliesFilter) {
          return null;
        }

        applyGuardsFn && (await applyGuardsFn(ctx));

        const transformedContext =
          applyPipesFn && (await applyPipesFn(ctx.getContextData()));

        ctx.applyTransformation(transformedContext);

        const params = await paramsFactory(ctx);

        const resolvable = handle.apply(receiver.instance, params);
        const result = await this.asyncResolver.resolveAsyncValue(resolvable);
        await this.responseController.apply(ctx, result);
      } catch (err) {
        rethrowWithContext(err, ctx);
      }
    };
  }

  private reflectParams(handle: Function) {
    return Reflect.getMetadata(
      PARAM_METADATA,
      handle
    ) as IParamDecoratorMetadata[];
  }
}
