import { CommandContainer } from '@core/command';
import { Injector, MethodDescriptor, ModuleContainer, Reflector } from '@core/di';
import {
  ApplicationCommandProxy,
  CommandProxy,
  CommonExceptionHandler,
  EventProxy,
  ExceptionHandlerImpl,
} from '@core/lifecycle';
import { ApplicationCommandRouteImpl, EventRouteImpl } from '@core/router';
import {
  APPLICATION_COMMAND_METADATA,
  ApplicationCommandMetadata,
  ApplicationCommandRoute,
  ApplicationSlashCommandRoute,
  COMMAND_METADATA,
  CommandOptions,
  CommandRoute,
  EVENT_METADATA,
  EventRoute,
  EXCEPTION_HANDLER,
  EXCEPTION_HANDLER_METADATA,
  ExceptionHandlerMetadata,
  GLOBAL_EXCEPTION_HANDLER,
  isEmpty,
  isNil,
  MessageMatcher,
  ROUTER_METADATA,
  RouterDecoratorOptions,
  SUB_COMMAND_METADATA,
  SubCommandOptions,
  UniqueTypeArray,
  WatsonEvent,
} from '@watsonjs/common';

import { RouterRef } from './application-router';
import { CommandRouteImpl } from './command/command-route';
import { RouteHandlerFactory } from './route-handler-factory';

const ROUTE_METADATA = [
  COMMAND_METADATA,
  SUB_COMMAND_METADATA,
  EVENT_METADATA,
  APPLICATION_COMMAND_METADATA,
];

interface RouteMethodMetadata<T = any> {
  metadata: T;
  key: string;
  method: MethodDescriptor;
}

export class RouteExplorer {
  private eventRoutes = new WeakMap<
    /* Route descriptor */ Function,
    EventRoute
  >();
  private commandRoutes = new WeakMap<
    /* Route descriptor */ Function,
    CommandRoute
  >();
  private applicationCommandRoutes = new WeakMap<
    /* Route descriptor */ Function,
    ApplicationCommandRoute
  >();

  private eventProxies = new Map<WatsonEvent, EventProxy>();
  private _commandProxies = new Map<MessageMatcher, EventProxy>();
  private routeHandlerFactory = new RouteHandlerFactory();

  public async explore(injector: Injector) {
    const { modules } = await injector.get(ModuleContainer);
    const commandContainer = await injector.get(CommandContainer);
    const routerRefs: RouterRef[] = new UniqueTypeArray();

    for (const [metatype, { injector, routers }] of modules) {
      const refs = await Promise.all(
        routers.map((router) => injector.get(router))
      );
      routerRefs.push(...refs);
    }

    for (const router of routerRefs) {
      await this._mapRoutesOfRouter(router, commandContainer);
    }
  }

  private async _mapRoutesOfRouter(
    routerRef: RouterRef,
    commandContainer: CommandContainer
  ) {
    const { metatype } = routerRef;
    const methods = Reflector.reflectMethodsOfType(metatype);
    const routerMetadata = Reflector.reflectMetadata<RouterDecoratorOptions>(
      ROUTER_METADATA,
      metatype
    );

    const methodsMetadata = methods.reduce((metadata, method) => {
      ROUTE_METADATA.map((key) => ({
        metadata: Reflector.reflectMetadata(key, method.descriptor),
        method,
        key,
      }))
        .filter(({ metadata }) => !isNil(metadata))
        .forEach((meta) =>
          !isNil(metadata[meta.key])
            ? metadata[meta.key].push(meta)
            : (metadata[meta.key] = [meta])
        );

      return metadata;
    }, {}) as { [K: string]: RouteMethodMetadata[] };

    const commandMetadata = methodsMetadata[COMMAND_METADATA] ?? [];
    const subCommandMetadata = methodsMetadata[SUB_COMMAND_METADATA] ?? [];
    const eventMetadata = methodsMetadata[EVENT_METADATA] ?? [];
    const interactionMetadata =
      methodsMetadata[APPLICATION_COMMAND_METADATA] ?? [];

    for (const { method, metadata } of commandMetadata) {
      const route = await this._bindCommandRoute(
        routerRef,
        method,
        metadata,
        routerMetadata
      );

      commandContainer.apply(route);
    }

    for (const { method, metadata } of interactionMetadata) {
      await this._bindInteractionRoute(
        routerRef,
        method,
        metadata,
        routerMetadata
      );
    }

    for (const { method, metadata } of eventMetadata) {
      await this._bindEventRoute(routerRef, method, metadata);
    }

    /**
     * Subcommands are mapped last as they
     * depend on either a sub-command
     * or a command route to already
     * exist.
     */
    while (!isEmpty(subCommandMetadata)) {
      const nextMetadata = subCommandMetadata.shift()!;
      const { metadata, method } = nextMetadata;
      const { parent } = metadata as SubCommandOptions;
      const parentRef =
        this.commandRoutes.get(parent) ??
        <ApplicationSlashCommandRoute>this.applicationCommandRoutes.get(parent);

      if (isNil(parentRef)) {
        subCommandMetadata.push(nextMetadata);
        continue;
      }

      let routeRef: CommandRoute | ApplicationCommandRoute;

      if (parentRef instanceof ApplicationCommandRouteImpl) {
        routeRef = await this._bindInteractionRoute(
          routerRef,
          method,
          metadata,
          routerMetadata,
          parentRef
        );
      } else if (parentRef instanceof CommandRouteImpl) {
        routeRef = await this._bindCommandRoute(
          routerRef,
          method,
          metadata,
          routerMetadata,
          parentRef
        );
      }

      if (isNil(routeRef!)) {
        throw "boo!";
      }

      if (isNil(parentRef.children)) {
        parentRef.children = new Map();
      }

      const commandNames = [
        routeRef.name,
        ...((<CommandRoute>routeRef!)?.alias ?? []),
      ];

      for (const name of commandNames) {
        const existing = parentRef.children.get(name);

        if (!isNil(existing)) {
          throw `Sub command with name "${name}" already exists as an alias of command "${existing.name}" in "${routerRef.name}"`;
        }

        parentRef.children.set(name, <any>routeRef);
      }
    }
  }

  private async _bindCommandRoute(
    routerRef: RouterRef,
    method: MethodDescriptor,
    metadata: CommandOptions | SubCommandOptions,
    routerMetadata: RouterDecoratorOptions,
    parent?: CommandRoute
  ): Promise<CommandRoute> {
    const { descriptor } = method;

    const routeRef = new CommandRouteImpl(
      metadata as CommandOptions,
      routerMetadata,
      routerRef,
      method,
      parent
    );
    const matcher = await routerRef.get(MessageMatcher);
    this.commandRoutes.set(descriptor, routeRef);

    const handlerFn = await this.routeHandlerFactory.createCommandHandler(
      routeRef,
      descriptor,
      routerRef
    );
    const exceptionHandler = await this._createExceptionHandler(
      routerRef,
      method
    );

    let proxyRef = this._commandProxies.get(matcher);

    if (isNil(proxyRef)) {
      proxyRef = new CommandProxy(matcher);
      this._commandProxies.set(matcher, proxyRef);
    }

    proxyRef.bind(routeRef, handlerFn, exceptionHandler);
    return routeRef;
  }

  private async _bindInteractionRoute(
    routerRef: RouterRef,
    method: MethodDescriptor,
    metadata: ApplicationCommandMetadata | SubCommandOptions,
    routerMetadata: RouterDecoratorOptions,
    parent?: ApplicationCommandRoute
  ): Promise<ApplicationCommandRoute> {
    const { descriptor } = method;

    const routeRef = new ApplicationCommandRouteImpl(
      metadata,
      routerMetadata,
      routerRef,
      method
    );

    this.applicationCommandRoutes.set(descriptor, routeRef);

    const handlerFn =
      await this.routeHandlerFactory.createApplicationCommandHandler();
    const exceptionHandler = await this._createExceptionHandler(
      routerRef,
      method
    );

    let proxyRef = this.eventProxies.get(WatsonEvent.INTERACTION_CREATE);

    if (isNil(proxyRef)) {
      proxyRef = new ApplicationCommandProxy();
      this.eventProxies.set(WatsonEvent.INTERACTION_CREATE, proxyRef);
    }

    proxyRef.bind(routeRef, handlerFn, exceptionHandler);
    return routeRef;
  }

  private async _bindEventRoute(
    routerRef: RouterRef,
    method: MethodDescriptor,
    metadata: WatsonEvent
  ): Promise<EventRoute> {
    const { descriptor } = method;

    const routeRef = new EventRouteImpl(metadata, routerRef, method);
    this.eventRoutes.set(descriptor, routeRef);

    const handlerFn = await this.routeHandlerFactory.createEventHandler();
    const exceptionHandler = await this._createExceptionHandler(
      routerRef,
      method
    );

    let proxyRef = this.eventProxies.get(WatsonEvent.INTERACTION_CREATE);

    if (isNil(proxyRef)) {
      proxyRef = new ApplicationCommandProxy();
      this.eventProxies.set(WatsonEvent.INTERACTION_CREATE, proxyRef);
    }

    proxyRef.bind(routeRef, handlerFn, exceptionHandler);

    return routeRef;
  }

  private async _createExceptionHandler(
    routerRef: RouterRef,
    method: MethodDescriptor
  ) {
    const { metatype } = routerRef;
    const { descriptor } = method;

    const defaultHandlers = [new CommonExceptionHandler()];
    const moduleExceptionHandlers = await routerRef.get(EXCEPTION_HANDLER, []);
    const globalExceptionHandlers = await routerRef.get(
      GLOBAL_EXCEPTION_HANDLER,
      []
    );

    const routerExceptionHandlers =
      Reflector.reflectMetadata<ExceptionHandlerMetadata[]>(
        EXCEPTION_HANDLER_METADATA,
        metatype
      ) ?? [];

    const routeExceptionHandlers =
      Reflector.reflectMetadata<ExceptionHandlerMetadata[]>(
        EXCEPTION_HANDLER_METADATA,
        descriptor
      ) ?? [];

    const customHandlers = [
      ...moduleExceptionHandlers,
      ...globalExceptionHandlers,
      ...routerExceptionHandlers,
      ...routeExceptionHandlers,
    ];

    const handlers = [...customHandlers, ...defaultHandlers];
    const handler = new ExceptionHandlerImpl(handlers as any);

    return handler;
  }
}
