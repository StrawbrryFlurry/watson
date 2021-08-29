import {
  CommandOptions,
  CommandRoute,
  Prefix,
  ReceiverDef,
  ReceiverOptions,
  WatsonEvent,
} from "@watsonjs/common";

import { RouteRef } from "..";
import { InstanceWrapper, MethodValue } from "../../injector";
import { WatsonContainer } from "../../watson-container";
import { CommandConfigurationHost } from "./command-configuration-host";

export class CommandRouteImpl
  extends RouteRef<WatsonEvent.MESSAGE_CREATE>
  implements CommandRoute
{
  // TODO:
  // Have this as a separate class to hold command meta
  // or store everything on this class
  // Pref option 2.
  public readonly configuration: CommandConfigurationHost;
  public readonly handler: Function;
  public readonly host: InstanceWrapper<ReceiverDef>;
  public readonly commandPrefix: Prefix;

  constructor(
    commandOptions: CommandOptions,
    receiverOptions: ReceiverOptions,
    receiver: InstanceWrapper<ReceiverDef>,
    handler: MethodValue,
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

  public get name() {
    return this.configuration.name;
  }

  public get params() {
    return this.configuration.params || [];
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
