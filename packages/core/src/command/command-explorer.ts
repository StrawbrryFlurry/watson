import {
  COMMAND_ARGUMENTS,
  COMMAND_OPTIONS_METADATA,
  COMMAND_RESTRICTION_METADATA,
  ICommandOptions,
  ICommandRestrictionMetadata,
  IParamDecoratorMetadata,
  IReceiverOptions,
  isEmpty,
  RECEIVER_OPTIONS_METADATA,
  TReceiver,
  Type,
} from '@watson/common';
import { PermissionString } from 'discord.js';

import { EventRoute } from '../event';
import { InstanceWrapper, MetadataResolver } from '../injector';
import { Logger } from '../logger';
import { WatsonContainer } from '../watson-container';
import { CommandRoute } from './command-route';

export interface ICommandRestrictions {
  permissions: PermissionString[];
  roles: string[];
  channels: string[];
  channelIds: string[];
  allPermissionsRequired: boolean;
}

/**
 * Resolves commands from the WatsonContainer instance
 * Checks @\Commmand and @\Receiver decorator metadata
 */
export class CommandExplorer {
  private container: WatsonContainer;
  private resolver: MetadataResolver;

  private logger = new Logger("CommandExplorer");

  /**
   * Holds all commands registered in the application
   */
  private _commands = new Set<CommandRoute>();
  private _events = new Set<EventRoute<any>>();

  constructor(container: WatsonContainer) {
    this.container = container;
    this.resolver = new MetadataResolver(container);
  }

  public explore() {
    this.resolveReceiverData();
  }

  public get commands() {
    return this._commands;
  }

  private resolveReceiverData() {
    const receivers = this.container.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper, host } = receiver;

      const receiverOptions = this.resolver.getMetadata<IReceiverOptions>(
        RECEIVER_OPTIONS_METADATA,
        wrapper.metatype
      );

      this.resolveCommandsOfReceiver(wrapper, receiverOptions);
    }
  }

  private resolveCommandsOfReceiver(
    receiver: InstanceWrapper<TReceiver>,
    receiverOptions: IReceiverOptions
  ) {
    const methods = this.resolver.resolveMethodsFromMetatype(receiver.metatype);

    if (isEmpty(methods)) {
      return;
    }

    for (const method of methods) {
      const commandOptions =
        this.resolver.getMetadata<ICommandOptions>(
          COMMAND_OPTIONS_METADATA,
          method.descriptor
        ) || {};

      const restrictions = this.resolveCommandRestrictions(method.descriptor);
      const commandArgs = this.resolveCommandArgs(
        receiver.metatype,
        method.name
      );
      commandOptions["restrictions"] = restrictions;

      const handle = new CommandRoute(
        method,
        receiverOptions,
        commandOptions,
        commandArgs,
        receiver,
        this.container
      );

      this.commands.add(handle);
    }
  }

  private resolveCommandRestrictions(descriptor: Type) {
    const restrictionMetadata = this.resolver.getMetadata<
      ICommandRestrictionMetadata<any>[]
    >(COMMAND_RESTRICTION_METADATA, descriptor);

    if (typeof restrictionMetadata === "undefined") {
      return undefined;
    }

    const permissions: PermissionString[] = [];
    const roles: string[] = [];
    const channels: string[] = [];
    const channelIds: string[] = [];
    let allPermissionsRequired: boolean;

    for (let permission of restrictionMetadata) {
      if (permission.type === "permission") {
        const _permission = permission as ICommandRestrictionMetadata<"permission">;
        permissions.push(..._permission.payload);
        allPermissionsRequired = _permission.options.allRequired || false;
      } else if (permission.type === "role") {
        const _permission = permission as ICommandRestrictionMetadata<"role">;
        roles.push(..._permission.payload);
      } else if (permission.type === "channel") {
        const _permission = permission as ICommandRestrictionMetadata<"channel">;
        if (
          typeof _permission.options?.isId === "undefined" ||
          _permission.options.isId === false
        ) {
          return channels.push(..._permission.payload);
        }

        return channelIds.push(..._permission.payload);
      }
    }

    return {
      permissions,
      channels,
      channelIds,
      roles,
      allPermissionsRequired,
    };
  }

  private resolveCommandArgs(receiver: Type, propertyKey: string) {
    const metadata =
      this.resolver.getMetadata<IParamDecoratorMetadata[]>(
        COMMAND_ARGUMENTS,
        receiver,
        propertyKey
      ) || [];

    return metadata;
  }
}
