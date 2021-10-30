import { MethodDescriptor, ReceiverRef } from '@core/di';
import { CommandConfiguration, CommandOptions, CommandRoute, isNil, ReceiverOptions, WatsonEvent } from '@watsonjs/common';

import { CommandConfigurationImpl } from '.';
import { RouteRef } from '../route-ref';

export class CommandRouteImpl
  extends RouteRef<WatsonEvent.COMMAND>
  implements CommandRoute
{
  public readonly configuration: CommandConfigurationImpl;
  public readonly handler: Function;
  public readonly host: ReceiverRef;
  public readonly parent: CommandRoute | null = null;

  public children: Map<string, CommandRoute> | null = null;

  constructor(
    commandOptions: CommandOptions,
    receiverOptions: ReceiverOptions,
    receiver: ReceiverRef,
    handler: MethodDescriptor,
    parent?: CommandRoute
  ) {
    super("command", WatsonEvent.COMMAND);

    this.configuration = new CommandConfigurationImpl(
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
