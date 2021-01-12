import {
  COMMAND_METADATA,
  EVENT_METADATA,
  IClientEvent,
  ICommandOptions,
  PartialApplicationCommand,
  RECEIVER_METADATA,
  SLASH_COMMAND_METADATA,
  TReceiver,
  Type,
} from '@watson/common';
import { InstanceWrapper, MetadataResolver } from 'injector';
import { WatsonContainer } from 'watson-container';

import { CommandRoute } from './command';
import { ConcreteEventRoute } from './event';
import { EventRoute } from './event-route';
import { SlashRoute } from './slash';

export class RouteExplorer {
  private constainer: WatsonContainer;
  private resolver: MetadataResolver;

  private _eventRoutes = new Set<EventRoute<any>>();
  private _commandRoutes = new Set<CommandRoute>();
  private _slashRoutes = new Set<any>();

  constructor(container: WatsonContainer) {
    this.constainer = container;
    this.resolver = new MetadataResolver(container);
  }

  public explore() {
    const receivers = this.constainer.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper } = receiver;

      this.reflectEventRoutes(wrapper);
      this.reflectCommandRoutes(wrapper);
      this.reflectSlashRoutes(wrapper);
    }
  }

  private reflectEventRoutes(receiver: InstanceWrapper<TReceiver>) {
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

      this._eventRoutes.add(routeRef);
    }
  }

  private reflectCommandRoutes(receiver: InstanceWrapper<TReceiver>) {
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

      this._eventRoutes.add(routeRef);
    }
  }

  private reflectSlashRoutes(receiver: InstanceWrapper<TReceiver>) {
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

      this._slashRoutes.add(routeRef);
    }
  }

  public getRoutes() {
    return {
      slash: [...this._slashRoutes] as SlashRoute[],
      event: [...this._eventRoutes] as EventRoute<any>[],
      command: [...this._commandRoutes] as CommandRoute[],
    };
  }

  private reflectReceiverMehtods(receiver: Type) {
    return this.resolver.reflectMethodsFromMetatype(receiver);
  }
}
