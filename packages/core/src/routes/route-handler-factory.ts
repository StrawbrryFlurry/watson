import {
  CanActivate,
  CommandContextData,
  ContextDataTypes,
  ContextEventTypes,
  EventContextData,
  EventException,
  Filter,
  FILTER_METADATA,
  GUARD_METADATA,
  IParamDecoratorMetadata,
  isEmpty,
  isFunction,
  isNil,
  PARAM_METADATA,
  PIPE_METADATA,
  PipeTransform,
  SlashContextData,
  TReceiver,
  UnauthorizedException,
} from "@watsonjs/common";
import { Base, ClientEvents } from "discord.js";

import { DiscordJSAdapter } from "../adapters";
import { ModuleInitException } from "../exceptions";
import { rethrowWithContext } from "../helpers";
import { InstanceWrapper, Module } from "../injector";
import {
  AsyncContextResolver,
  EventExecutionContext,
  ResponseController,
} from "../lifecycle";
import { BAD_CHANGEALE_IMPLEMENTATION, CHANGEABLE_NOT_FOUND } from "../logger";
import { RouteParamsFactory } from "../routes";
import { WatsonContainer } from "../watson-container";
import { CommandRoute } from "./command";
import { ConcreteEventRoute } from "./event";
import { EventRoute } from "./event-route";
import { SlashRoute } from "./slash";

export type IHandlerFunction = (
  adapter: DiscordJSAdapter,
  eventData: unknown[]
) => Promise<void>;

export class RouteHandlerFactory {
  private paramsFactory = new RouteParamsFactory();
  private responseController = new ResponseController();
  private asyncResolver = new AsyncContextResolver();

  constructor(private container: WatsonContainer) {}

  public async createCommandHandler(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IHandlerFunction> {
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

  public async createSlashHandler(
    route: SlashRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IHandlerFunction> {
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

  public async createEventHandler<T extends keyof ClientEvents>(
    route: ConcreteEventRoute<T>,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IHandlerFunction> {
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
          BAD_CHANGEALE_IMPLEMENTATION(
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
        const wrapper = module.injectables.get(guard);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            CHANGEABLE_NOT_FOUND(
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

  private createGuardsFn(guards: CanActivate[]) {
    if (isEmpty(guards)) {
      return null;
    }

    return async (ctx: EventExecutionContext) => {
      for (const guard of guards) {
        const res = guard.canActivate(ctx);
        const activationRes = await this.asyncResolver.resolveAsyncValue<
          boolean,
          boolean
        >(res);

        if (activationRes === false) {
          throw new UnauthorizedException();
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
          BAD_CHANGEALE_IMPLEMENTATION(
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
        const wrapper = module.injectables.get(filter);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            CHANGEABLE_NOT_FOUND(
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

  private createFiltersFn(filters: Filter[]) {
    if (isEmpty(filters)) {
      return null;
    }

    return async (ctx: EventExecutionContext) => {
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
      PIPE_METADATA,
      handler,
      receiver
    );

    let resolvedPipes: PipeTransform[] = [];

    const checkTransform = (pipe: PipeTransform) => {
      if (typeof pipe.transform === "undefined") {
        throw new ModuleInitException(
          BAD_CHANGEALE_IMPLEMENTATION(
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
        const wrapper = module.injectables.get(pipe);

        if (typeof wrapper === "undefined") {
          throw new ModuleInitException(
            CHANGEABLE_NOT_FOUND(
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
      const pipeResults = [];
      for (const pipe of pipes) {
        const res = pipe.transform(ctx);
        const transformedCtx = await this.asyncResolver.resolveAsyncValue(res);

        pipeResults.push(transformedCtx);
      }

      const transformation = pipeResults.reduce(
        (changes, change) => ({ ...changes, ...change }),
        {}
      );

      return transformation;
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
    route: EventRoute<any>,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ) {
    const guards = this.reflectGuards(handle, receiver);
    const filters = this.reflectFilters(handle, receiver);
    const pipes = this.reflectPipes(handle, receiver);

    const params = this.reflectParams(receiver, handle);

    const paramsFactory = (ctx: EventExecutionContext) => {
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
    applyGuardsFn?: (ctx: EventExecutionContext) => Promise<void>;
    applyFilterFn?: (ctx: EventExecutionContext) => Promise<boolean>;
    paramsFactory: (ctx: EventExecutionContext) => Promise<unknown[]>;
    receiver: InstanceWrapper<TReceiver>;
    handle: Function;
    type: ContextEventTypes;
    route: EventRoute<any>;
  }) {
    return async (adapter: DiscordJSAdapter, event: Base[]) => {
      const matches = route.matchEvent(event);

      if (!matches) {
        return null;
      }

      const ctx = new EventExecutionContext(
        type,
        event,
        route,
        adapter,
        this.container
      );

      try {
        const data = await route.createContextData(event);
        ctx.applyTransformation(data);

        const compliesFilter = applyFilterFn && (await applyFilterFn(ctx));

        if (!isNil(applyFilterFn) && !compliesFilter) {
          return null;
        }

        applyGuardsFn && (await applyGuardsFn(ctx));

        const transfromedParams = applyPipesFn && (await applyPipesFn(ctx));

        if (!isNil(transfromedParams)) {
          data.params = transfromedParams;
          ctx.applyTransformation(data);
        }

        const params = await paramsFactory(ctx);
        const resolvable = handle.apply(receiver.instance, params);
        const result = (await this.asyncResolver.resolveAsyncValue(
          resolvable
        )) as RouteResult;
        await this.responseController.apply(ctx, result);
      } catch (err) {
        if (err instanceof EventException) {
          rethrowWithContext(err, ctx);
        } else {
          throw err;
        }
      }
    };
  }

  private reflectParams(
    receiver: InstanceWrapper<TReceiver>,
    handle: Function
  ) {
    return (
      (Reflect.getMetadata(
        PARAM_METADATA,
        receiver.metatype,
        handle.name
      ) as IParamDecoratorMetadata[]) || []
    );
  }
}
