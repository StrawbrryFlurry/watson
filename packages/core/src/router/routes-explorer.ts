import { CommandContainer } from '@core/command';
import { Injector, MethodDescriptor, ModuleContainer, Reflector, RouterRef } from '@core/di';
import { CommonExceptionHandler, EventProxy, ExceptionHandlerImpl } from '@core/lifecycle';
import {
  APPLICATION_COMMAND_METADATA,
  BaseRoute,
  COMMAND_METADATA,
  CommandOptions,
  CommandRoute,
  EVENT_METADATA,
  EventRoute,
  EXCEPTION_HANDLER,
  EXCEPTION_HANDLER_METADATA,
  ExceptionHandler,
  ExceptionHandlerMetadata,
  GLOBAL_EXCEPTION_HANDLER,
  isEmpty,
  isNil,
  ROUTER_METADATA,
  RouterDecoratorOptions,
  SUB_COMMAND_METADATA,
  SubCommandOptions,
  Type,
  UniqueTypeArray,
  WatsonEvent,
} from '@watsonjs/common';

import { CommandRouteImpl, LifecycleFunction, RouteHandlerFactory } from '.';

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
  private commandRoutes = new WeakMap<Function, CommandRoute>();
  private interactionRoutes = new WeakMap<Function, any>();

  private eventProxies = new Map<WatsonEvent, EventProxy>();
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
  /*
      const {
        createCommandHandler,
        //  createEventHandler,
        //  createSlashHandler,
      } = this.routeHandlerFactory;

      // await this.reflectRoute(
      //   wrapper,
      //   EVENT_METADATA,
      //   EventRoute,
      //   createEventHandler,
      //   this.eventRoutes,
      //   (metadata: WatsonEvent) => metadata,
      //   MAP_EVENT
      // );

      await this.reflectRoute(
        wrapper,
        COMMAND_METADATA,
        CommandRoute,
        CommandProxy,
        [this.container.getCommands()],
        createCommandHandler,
        this.commandRoutes,
        () => WatsonEvent.MESSAGE_CREATE,
        MAP_COMMAND
      );

      //  await this.reflectRoute(
      //    wrapper,
      //    SLASH_COMMAND_METADATA,
      //    SlashRoute,
      //    createSlashHandler,
      //    this.slashRoutes,
      //    () => WatsonEvent.INTERACTION_CREATE,
      //    MAP_SLASH_COMMAND,
      //    true
      //  );
    }
    this.logger.logMessage(COMPLETED());
  }
*/
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

    // We need to map regular commands without parents first
    for (const { method, metadata } of commandMetadata) {
      const route = await this._bindCommandRoute(
        routerRef,
        method,
        metadata,
        routerMetadata
      );

      commandContainer.apply(route);
    }

    while (!isEmpty(subCommandMetadata)) {
      const nextMetadata = subCommandMetadata.shift()!;
      const { metadata, method } = nextMetadata;
      const { parent } = metadata as SubCommandOptions;
      const parentRef = this.commandRoutes.get(parent);

      if (isNil(parentRef)) {
        subCommandMetadata.push(nextMetadata);
        continue;
      }

      const routeRef = await this._bindCommandRoute(
        routerRef,
        method,
        metadata,
        routerMetadata,
        parentRef
      );

      if (isNil(parentRef.children)) {
        parentRef.children = new Map();
      }

      const commandNames = [routeRef.name, ...routeRef.alias];

      for (const name of commandNames) {
        const existing = parentRef.children.get(name);

        if (!isNil(existing)) {
          throw `Sub command with name "${name}" already exists as an alias of command "${existing.name}" in "${routerRef.name}"`;
        }

        parentRef.children.set(name, routeRef);
      }
    }

    for (const { method, metadata } of eventMetadata) {
      // TODO:
      this._bindEventRoute();
    }

    for (const { method, metadata } of interactionMetadata) {
      // TODO:
      this._bindInteractionRoute();
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

    this.commandRoutes.set(descriptor, routeRef);

    const handlerFn = await this.routeHandlerFactory.createCommandHandler(
      routeRef,
      descriptor,
      routerRef
    );

    let proxyRef = this.eventProxies.get(WatsonEvent.COMMAND);

    if (isNil(proxyRef)) {
      proxyRef = new (EventProxy as any)();
      this.eventProxies.set(WatsonEvent.COMMAND, proxyRef!);
    }

    const exceptionHandler = await this._createExceptionHandler(
      routerRef,
      method
    );

    proxyRef!.bind(routeRef, handlerFn, exceptionHandler);

    return routeRef;
  }

  private async _bindEventRoute() {}

  private async _bindInteractionRoute() {}

  private _bindHandler(
    event: WatsonEvent,
    route: BaseRoute,
    proxyType: Type,
    handler: LifecycleFunction,
    exceptionHandler: ExceptionHandler,
    proxyArgs: unknown[]
  ) {
    // if (!this.eventProxies.has(event)) {
    //   this.eventProxies.set(event, new proxyType(...proxyArgs));
    // }
    //
    // const proxyRef = this.eventProxies.get(event);
    // proxyRef.bind(route, handler, exceptionHandler);
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

    const handlers = [...defaultHandlers, ...customHandlers];
    const handler = new ExceptionHandlerImpl(handlers as any);

    return handler;
  }
  /*
  private async reflectCommands(router: InstanceWrapper<RouterDef>) {
    const { metatype } = router;
    const routerMethods = this.reflecRouterDefMehtods(metatype);
    for (const method of routerMethods) {
      const { descriptor, name } = method;
      this.scanner.getMetadata<unknown[]>(DESIGN_PARAMETERS, metatype, name);
    }
  }

  private async reflectRoute<T extends string>(
    router: InstanceWrapper<RouterDef>,
    metadataKey: string,
    routeType: Type,
    eventProxyType: Type<EventProxy>,
    proxyArgs: unknown[],
    handlerFactory: HandlerFactory,
    collectionRef: Set<IBaseRoute>,
    eventFunction: (metadata: unknown) => WatsonEvent,
    logMessage: Function,
    isWsEvent?: boolean
  ) {
    const { metatype } = router;
    const routerMethods = this.reflecRouterDefMehtods(metatype);

    for (const method of routerMethods) {
      const { descriptor } = method;
      const metadata = this.scanner.getMetadata<T>(metadataKey, descriptor);
      const routerMetadata = this.scanner.getMetadata<T>(
        ROUTER_METADATA,
        router.metatype
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new routeType(
        metadata,
        routerMetadata,
        router,
        descriptor,
        this.container
      );

      if (metadataKey === COMMAND_METADATA) {
        this.container.addCommand(routeRef);
      }

      const moduleId = this.container.generateTokenFromModule(router.host);

      const handler = await handlerFactory.call(
        this.routeHandlerFactory,
        routeRef,
        method.descriptor,
        router,
        moduleId
      );

      collectionRef.add(routeRef);
      this.logger.logMessage(logMessage(routeRef));

      const exceptionHandler = this.createExceptionHandler(
        router.metatype,
        method.descriptor,
        router.host
      );

      this.bindHandler(
        eventFunction(metadata),
        routeRef,
        eventProxyType,
        handler,
        exceptionHandler,
        proxyArgs
      );
    }
  }

  private reflectExceptionHandlers(
    metadataKey: string,
    reflectee: Type | Function,
    module: Module
  ) {
    const handlerMetadata = this.scanner.getArrayMetadata<
      EventExceptionHandler[]
    >(metadataKey, reflectee);

    const instances = handlerMetadata.filter(
      (e: EventExceptionHandler) => e instanceof EventExceptionHandler
    );
    const injectables = handlerMetadata.filter(isFunction);
    const injectableInstances = injectables.map(
      (injectable) =>
        module.injectables.get(injectable).instance as EventExceptionHandler
    );

    const hanlders = [...injectableInstances, ...instances];

    return hanlders;
  }

  public getEventProxies() {
    return this.eventProxies;
  }

  public getEventProxiesArray() {
    return iterate(this.eventProxies).toArray();
  }

  public getEventProxy(event: WatsonEvent) {
    return this.eventProxies.get(event);
  }
*/
}
