import {
  COMMAND_METADATA,
  EVENT_METADATA,
  EventExceptionHandler,
  EXCEPTION_HANDLER_METADATA,
  isFunction,
  PartialApplicationCommand,
  SLASH_COMMAND_METADATA,
  TReceiver,
  Type,
  WatsonEvent,
} from '@watsonjs/common';
import iterate from 'iterare';

import { InstanceWrapper, MetadataResolver, Module } from '../injector';
import { CommonExceptionHandler, EventProxy, ExceptionHandler } from '../lifecycle';
import { COMPLETED, EXPLORE_RECEIVER, EXPLORE_START, Logger, MAP_COMMAND, MAP_EVENT, MAP_SLASH_COMMAND } from '../logger';
import { WatsonContainer } from '../watson-container';
import { AbstractEventRoute } from './abstract-route';
import { CommandRoute } from './command';
import { EventRoute } from './event';
import { IHandlerFactory, IHandlerFunction, RouteHandlerFactory } from './route-handler-factory';
import { SlashRoute } from './slash';

export class RouteExplorer {
  private constainer: WatsonContainer;
  private resolver: MetadataResolver;

  private logger = new Logger("RouteExplorer");

  private eventRoutes = new Set<EventRoute<any>>();
  private commandRoutes = new Set<CommandRoute>();
  private slashRoutes = new Set<SlashRoute>();

  private eventProxies = new Map<WatsonEvent, EventProxy<any>>();
  private routeHanlderFactory: RouteHandlerFactory;

  constructor(container: WatsonContainer) {
    this.constainer = container;
    this.resolver = new MetadataResolver(container);
    this.routeHanlderFactory = new RouteHandlerFactory(container);
  }

  public async explore() {
    this.logger.logMessage(EXPLORE_START());
    const receivers = this.constainer.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper } = receiver;

      this.logger.logMessage(EXPLORE_RECEIVER(receiver.wrapper));

      const {
        createCommandHandler,
        createEventHandler,
        createSlashHandler,
      } = this.routeHanlderFactory;

      await this.reflectRoute(
        wrapper,
        EVENT_METADATA,
        EventRoute,
        createEventHandler,
        this.eventRoutes,
        (metadata: WatsonEvent) => metadata,
        MAP_EVENT
      );

      await this.reflectRoute(
        wrapper,
        COMMAND_METADATA,
        CommandRoute,
        createCommandHandler,
        this.commandRoutes,
        () => WatsonEvent.MESSAGE_CREATE,
        MAP_COMMAND
      );

      await this.reflectRoute(
        wrapper,
        SLASH_COMMAND_METADATA,
        SlashRoute,
        createSlashHandler,
        this.slashRoutes,
        () => WatsonEvent.INTERACTION_CREATE,
        MAP_SLASH_COMMAND,
        true
      );
    }

    this.logger.logMessage(COMPLETED());
  }

  private async reflectRoute(
    receiver: InstanceWrapper<TReceiver>,
    metadataKey: string,
    routeType: Type,
    handlerFactory: IHandlerFactory,
    collectionRef: Set<AbstractEventRoute<any>>,
    eventFunction: (metadata: unknown) => WatsonEvent,
    logMessage: Function,
    isWsEvent?: boolean
  ) {
    const { metatype } = receiver;
    const receiverMethods = this.reflectReceiverMehtods(metatype);

    for (const method of receiverMethods) {
      const { descriptor } = method;
      const metadata = this.resolver.getMetadata<PartialApplicationCommand>(
        metadataKey,
        descriptor
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new routeType(
        metadata,
        receiver,
        descriptor,
        this.constainer
      );

      const handler = await handlerFactory(
        routeRef,
        method.descriptor,
        receiver,
        receiver.host
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
    handler: IHandlerFunction,
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
    const customGlobalHandlers = this.constainer.getGlobalExceptionHandlers();
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
