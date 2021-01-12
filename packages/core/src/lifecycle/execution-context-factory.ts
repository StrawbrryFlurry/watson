import {
  CanActivate,
  CommandContextData,
  ContextDataTypes,
  EventContextData,
  ExecutionContext,
  Filter,
  FILTER_METADATA,
  GUARD_METADATA,
  isFunction,
  PipeTransform,
  SlashContextData,
  TReceiver,
  UnatuhorizedException,
} from '@watson/common';
import { Message } from 'discord.js';
import { ModuleInitException } from 'exceptions';
import { InstanceWrapper, Module } from 'injector';
import { badChangeableImplementation, changeableNotFound } from 'logger';
import { CommandRoute, RouteParamsFactory } from 'routes';

import { AsyncContextResolver } from './async-context-resolver';
import { CommandExecutionContext } from './execution-context';

export type IContextFactory<CT extends ContextDataTypes, A = any> = (
  ...eventData: A[]
) => Promise<void>;

export class ExecutionContextFactory {
  private paramsFactory: RouteParamsFactory;
  private asyncResolver = new AsyncContextResolver();

  constructor() {}

  public async createCommandContext(
    route: CommandRoute,
    handle: Function,
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ): Promise<IContextFactory<CommandContextData>> {
    const guards = this.createGuards(handle, receiver);
    const filters = this.createFilters(handle, receiver);
    const pipes = this.createPipes(handle, receiver);

    return async (message: Message) => {
      const ctx = new CommandExecutionContext();

      return;
    };
  }

  public async createSlashContext(): Promise<
    IContextFactory<SlashContextData>
  > {
    // get metadata
    // get guards
    // get filters
    // get restrictions

    return async (...args: unknown[]) => {};
  }

  public async createEventContext(): Promise<
    IContextFactory<EventContextData>
  > {
    // get metadata
    // get guards
    // get filters
    // get restrictions

    return async (...args: unknown[]) => {};
  }

  private createGuards(
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

  private createFilters(
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

  private createPipes(handler: Function, receiver: InstanceWrapper<TReceiver>) {
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
    return async (ctx: ExecutionContext) => {
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
}
