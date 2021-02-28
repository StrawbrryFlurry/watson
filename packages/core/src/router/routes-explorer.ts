import {
  BaseRoute,
  COMMAND_METADATA,
  EventExceptionHandler,
  EXCEPTION_HANDLER_METADATA,
  isFunction,
  RECEIVER_METADATA,
  TReceiver,
  Type,
  WatsonEvent,
} from '@watsonjs/common';
import iterate from 'iterare';

import { InstanceWrapper, MetadataResolver, Module } from '../injector';
import { CommonExceptionHandler, EventProxy, ExceptionHandler } from '../lifecycle';
import { COMPLETED, EXPLORE_RECEIVER, EXPLORE_START, Logger, MAP_COMMAND } from '../logger';
import { WatsonContainer } from '../watson-container';
import { CommandRouteHost } from './command';
import { EventRouteHost } from './event';
import { RouteHandlerFactory, THandlerFactory, TLifecycleFunction } from './route-handler-factory';
import { SlashRoute } from './slash';

export class RouteExplorer {
  private container: WatsonContainer;
  private resolver: MetadataResolver;

  private logger = new Logger("RouteExplorer");

  private eventRoutes = new Set<EventRouteHost<any>>();
  private commandRoutes = new Set<CommandRouteHost>();
  private slashRoutes = new Set<SlashRoute>();

  private eventProxies = new Map<WatsonEvent, EventProxy<any>>();
  private routeHanlderFactory: RouteHandlerFactory;

  constructor(container: WatsonContainer) {
    this.container = container;
    this.resolver = new MetadataResolver(container);
    this.routeHanlderFactory = new RouteHandlerFactory(container);
  }

  public async explore() {
    this.logger.logMessage(EXPLORE_START());
    const receivers = this.container.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper } = receiver;

      this.logger.logMessage(EXPLORE_RECEIVER(receiver.wrapper));

      const {
        createCommandHandler,
        //  createEventHandler,
        //  createSlashHandler,
      } = this.routeHanlderFactory;

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
        CommandRouteHost,
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

  private async reflectRoute<T extends string>(
    receiver: InstanceWrapper<TReceiver>,
    metadataKey: string,
    routeType: Type,
    handlerFactory: THandlerFactory,
    collectionRef: Set<BaseRoute>,
    eventFunction: (metadata: unknown) => WatsonEvent,
    logMessage: Function,
    isWsEvent?: boolean
  ) {
    const { metatype } = receiver;
    const receiverMethods = this.reflectReceiverMehtods(metatype);

    for (const method of receiverMethods) {
      const { descriptor } = method;
      const metadata = this.resolver.getMetadata<T>(metadataKey, descriptor);
      const receiverMetadata = this.resolver.getMetadata<T>(
        RECEIVER_METADATA,
        receiver.metatype
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new routeType(
        metadata,
        receiverMetadata,
        receiver,
        descriptor,
        this.container
      );

      if (metadataKey === COMMAND_METADATA) {
        this.container.addCommand(routeRef);
      }

      const moduleId = this.container.generateTokenFromModule(receiver.host);

      const handler = await handlerFactory.call(
        this.routeHanlderFactory,
        routeRef,
        method.descriptor,
        receiver,
        moduleId
      );

      collectionRef.add(routeRef);
      this.logger.logMessage(logMessage(routeRef));

      const exceptionHandler = this.createExceptionHandler(
        receiver.metatype,
        method.descriptor,
        receiver.host
      );

      this.bindHandler(
        eventFunction(metadata),
        handler,
        exceptionHandler,
        isWsEvent
      );
    }

    this.logger.logMessage(COMPLETED());
  }

  private reflectReceiverMehtods(receiver: Type) {
    return this.resolver.reflectMethodsFromMetatype(receiver);
  }

  private reflectExceptionHandlers(
    metadataKey: string,
    reflectee: Type | Function,
    module: Module
  ) {
    const handlerMetadata = this.resolver.getArrayMetadata<
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

  private bindHandler(
    event: WatsonEvent,
    handler: TLifecycleFunction,
    exceptionHandler: ExceptionHandler,
    isWsEvent?: boolean
  ) {
    if (!this.eventProxies.has(event)) {
      this.eventProxies.set(event, new EventProxy(event, isWsEvent));
    }

    const proxyRef = this.eventProxies.get(event);
    proxyRef.bind(handler, exceptionHandler);
  }

  private createExceptionHandler(
    receiver: Type,
    method: Function,
    module: Module
  ) {
    const defaultHandlers = [new CommonExceptionHandler()];
    const customGlobalHandlers = this.container.getGlobalExceptionHandlers();
    const customReceiverHandlers = this.reflectExceptionHandlers(
      EXCEPTION_HANDLER_METADATA,
      receiver,
      module
    );
    const customCommandHandlers = this.reflectExceptionHandlers(
      EXCEPTION_HANDLER_METADATA,
      method,
      module
    );

    const customHandlers = [
      ...customGlobalHandlers,
      ...customReceiverHandlers,
      ...customCommandHandlers,
    ];

    const handlers = [...defaultHandlers, ...customHandlers];
    const handler = new ExceptionHandler(handlers);

    return handler;
  }
}
