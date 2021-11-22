import { MethodDescriptor } from '@core/di';
import {
  CommandConfiguration,
  CommandOptions,
  CommandRoute,
  isNil,
  RouterDecoratorOptions,
  WatsonEvent,
} from '@watsonjs/common';
import { RouterRef } from '@watsonjs/core';

import { CommandConfigurationImpl } from '.';
import { RouteRef } from '../route-ref';

export class CommandRouteImpl
  extends RouteRef<WatsonEvent.COMMAND>
  implements CommandRoute
{
  public readonly configuration: CommandConfigurationImpl;
  public readonly handler: Function;
  public readonly host: RouterRef;
  public readonly parent: CommandRoute | null = null;

  public children: Map<string, CommandRoute> | null = null;

  constructor(
    commandOptions: CommandOptions,
    routerOptions: RouterDecoratorOptions,
    router: RouterRef,
    handler: MethodDescriptor,
    parent?: CommandRoute
  ) {
    super("command", WatsonEvent.COMMAND);

    this.configuration = new CommandConfigurationImpl(
      this,
      commandOptions,
      routerOptions,
      handler
    );

    this.handler = handler.descriptor;
    this.host = router;
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
