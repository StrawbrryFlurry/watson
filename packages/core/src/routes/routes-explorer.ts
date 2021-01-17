import {
  COMMAND_METADATA,
  EVENT_METADATA,
  EventExceptionHandler,
  IClientEvent,
  ICommandOptions,
  PartialApplicationCommand,
  RECEIVER_ERROR_HANDLER_METADATA,
  RECEIVER_METADATA,
  SLASH_COMMAND_METADATA,
  TReceiver,
  Type,
} from '@watson/common';
import iterate from 'iterare';

import { InstanceWrapper, MetadataResolver } from '../injector';
import { CommonExceptionHandler, EventProxy, ExceptionHandler } from '../lifecycle';
import { WatsonContainer } from '../watson-container';
import { CommandRoute } from './command';
import { ConcreteEventRoute } from './event';
import { IHandlerFunction, RouteHandlerFactory } from './route-handler-factory';
import { SlashRoute } from './slash';

export class RouteExplorer {
  private constainer: WatsonContainer;
  private resolver: MetadataResolver;

  private eventRoutes = new Set<ConcreteEventRoute<any>>();
  private commandRoutes = new Set<CommandRoute>();
  private slashRoutes = new Set<SlashRoute>();

  private eventProxies = new Map<IClientEvent, EventProxy<any>>();
  private routeHanlderFactory: RouteHandlerFactory;

  constructor(container: WatsonContainer) {
    this.constainer = container;
    this.resolver = new MetadataResolver(container);
    this.routeHanlderFactory = new RouteHandlerFactory(container);
  }

  public async explore() {
    const receivers = this.constainer.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper } = receiver;

      await this.reflectEventRoutes(wrapper);
      await this.reflectCommandRoutes(wrapper);
      await this.reflectSlashRoutes(wrapper);
    }
  }

  private async reflectEventRoutes(receiver: InstanceWrapper<TReceiver>) {
    const { metatype } = receiver;
    const receiverMethods = this.reflectReceiverMehtods(metatype);

    for (const method of receiverMethods) {
      const { descriptor } = method;
      const metadata = this.resolver.getMetadata<IClientEvent>(
        EVENT_METADATA,
        descriptor
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new ConcreteEventRoute(
        metadata,
        receiver,
        descriptor,
        this.constainer
      );

      const handler = await this.routeHanlderFactory.createEventHandler(
        routeRef,
        descriptor,
        receiver,
        receiver.host
      );

      this.eventRoutes.add(routeRef);

      const exceptionHandler = this.createExceptionHandler(
        receiver.metatype,
        method.descriptor
      );

      this.bindHandler(metadata, handler, exceptionHandler);
    }
  }

  private async reflectCommandRoutes(receiver: InstanceWrapper<TReceiver>) {
    const { metatype } = receiver;
    const receiverMethods = this.reflectReceiverMehtods(metatype);
    const receiverOptions = this.resolver.getMetadata(
      RECEIVER_METADATA,
      metatype
    );

    for (const method of receiverMethods) {
      const metadata = this.resolver.getMetadata<ICommandOptions>(
        COMMAND_METADATA,
        method.descriptor
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new CommandRoute(
        metadata,
        receiverOptions,
        receiver,
        method,
        this.constainer
      );

      const handler = await this.routeHanlderFactory.createCommandHandler(
        routeRef,
        method.descriptor,
        receiver,
        receiver.host
      );

      this.commandRoutes.add(routeRef);

      const exceptionHandler = this.createExceptionHandler(
        receiver.metatype,
        method.descriptor
      );

      this.bindHandler("message", handler, exceptionHandler);
    }
  }

  private async reflectSlashRoutes(receiver: InstanceWrapper<TReceiver>) {
    const { metatype } = receiver;
    const receiverMethods = this.reflectReceiverMehtods(metatype);

    for (const method of receiverMethods) {
      const { descriptor } = method;
      const metadata = this.resolver.getMetadata<PartialApplicationCommand>(
        SLASH_COMMAND_METADATA,
        descriptor
      );

      if (!metadata) {
        continue;
      }

      const routeRef = new SlashRoute(
        metadata,
        receiver,
        descriptor,
        this.constainer
      );

      const handler = await this.routeHanlderFactory.createSlashHandler(
        routeRef,
        method.descriptor,
        receiver,
        receiver.host
      );

      this.slashRoutes.add(routeRef);

      const exceptionHandler = this.createExceptionHandler(
        receiver.metatype,
        method.descriptor
      );

      this.bindHandler(
        "INTERACTION_CREATE" as any,
        handler,
        exceptionHandler,
        true
      );
    }
  }

  private reflectReceiverMehtods(receiver: Type) {
    return this.resolver.reflectMethodsFromMetatype(receiver);
  }

  private reflectExceptionHandlers(
    metadataKey: string,
    reflectee: Type | Function
  ) {
    const handlerMetadata = this.resolver.getArrayMetadata<
      EventExceptionHandler<any>[]
    >(metadataKey, reflectee);

    const validHandlers = handlerMetadata.filter(
      (e: EventExceptionHandler<any>) =>
        e instanceof EventExceptionHandler && typeof e.catch !== "undefined"
    );

    return validHandlers;
  }

  public getEventProxies() {
    return this.eventProxies;
  }

  public getEventProxiesArray() {
    return iterate(this.eventProxies).toArray();
  }

  public getEventProxy(event: IClientEvent) {
    return this.eventProxies.get(event);
  }

  private bindHandler(
    event: IClientEvent,
    handler: IHandlerFunction<any>,
    exceptionHandler: ExceptionHandler,
    isWsEvent?: boolean
  ) {
    if (!this.eventProxies.has(event)) {
      this.eventProxies.set(event, new EventProxy(event, isWsEvent));
    }

    const proxyRef = this.eventProxies.get(event);
    proxyRef.bind(handler, exceptionHandler);
  }

  private createExceptionHandler(receiver: Type, method: Function) {
    const defaultHandlers = [new CommonExceptionHandler()];
    const customGlobalHandlers = this.constainer.getGlobalExceptionHandlers();
    const customReceiverHandlers = this.reflectExceptionHandlers(
      RECEIVER_ERROR_HANDLER_METADATA,
      receiver
    );
    const customCommandHandlers = this.reflectExceptionHandlers(
      RECEIVER_ERROR_HANDLER_METADATA,
      method
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
