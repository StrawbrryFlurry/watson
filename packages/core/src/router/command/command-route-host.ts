import {
  CommandConfiguration,
  CommandRoute,
  ICommandOptions,
  IParamDecoratorMetadata,
  IReceiverOptions,
  TReceiver,
  WatsonEvent,
} from '@watsonjs/common';

import { IMethodValue, InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { AbstractRoute } from '../abstract-route';
import { CommandConfigurationHost } from './command-configuration-host';

export interface IParamDecorator extends IParamDecoratorMetadata {}

export class CommandRouteHost
  extends AbstractRoute<WatsonEvent.MESSAGE_CREATE>
  implements CommandRoute {
  public readonly configuration: CommandConfigurationHost;
  public readonly handler: Function;
  public readonly host: InstanceWrapper<TReceiver>;

  constructor(
    commandOptions: ICommandOptions,
    receiverOptions: IReceiverOptions,
    receiver: InstanceWrapper<TReceiver>,
    handler: IMethodValue,
    container: WatsonContainer
  ) {
    super("command", WatsonEvent.MESSAGE_CREATE, container);

    this.configuration = new CommandConfigurationHost(
      this,
      commandOptions,
      receiverOptions,
      container.config,
      handler
    );

    this.handler = handler.descriptor;
    this.host = receiver;
  }

  getConfiguration(): CommandConfiguration {
    return this.configuration;
  }

  public get name() {
    return this.configuration.name;
  }

  public get params() {
    return this.configuration.params || [];
  }

  public get commandPrefix() {
    return this.configuration.prefix;
  }

  public get prefix() {
    return this.configuration.prefix.prefix;
  }

  public get alias() {
    return this.configuration.alias || [];
  }

  public get hasNamedPrefix(): boolean {
    return this.configuration.prefix.isNamedPrefix;
  }

  public hasName(name: string) {
    return this.alias.includes(name) || this.name === name;
  }
}
