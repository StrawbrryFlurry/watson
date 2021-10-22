import { MethodDescriptor, ReceiverRef } from '@core/di';
import { CommandConfiguration, CommandOptions, CommandRoute, isNil, ReceiverOptions, WatsonEvent } from '@watsonjs/common';

import { RouteRef } from '..';
import { CommandConfigurationHost } from './command-configuration-host';

export class CommandRouteImpl
  extends RouteRef<WatsonEvent.MESSAGE_CREATE>
  implements CommandRoute
{
  public readonly configuration: CommandConfigurationHost;
  public readonly handler: Function;
  public readonly host: ReceiverRef;
  public readonly parent: CommandRoute | null;

  constructor(
    commandOptions: CommandOptions,
    receiverOptions: ReceiverOptions,
    receiver: ReceiverRef,
    handler: MethodDescriptor,
    parent?: CommandRoute
  ) {
    super("command", WatsonEvent.MESSAGE_CREATE);

    this.configuration = new CommandConfigurationHost(
      this,
      commandOptions,
      receiverOptions,
      handler
    );

    this.handler = handler.descriptor;
    this.host = receiver;

    this.parent = parent ?? null;
  }

  public get isSubCommand(): boolean {
    return !isNil(this.parent);
  }

  public children: Map<string, string> | null = null;

  public getConfiguration(): CommandConfiguration {
    return this.configuration;
  }

  public get name() {
    return this.configuration.name;
  }

  public get params() {
    return this.configuration.params || [];
  }

  public get alias() {
    return this.configuration.alias || [];
  }

  public hasName(name: string) {
    return this.alias.includes(name) || this.name === name;
  }
}
