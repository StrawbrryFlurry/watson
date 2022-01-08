import { RouterRef } from '@core/router/application-router';
import { RouteRef } from '@core/router/route-ref';
import {
  ApplicationCommandConfiguration,
  ApplicationCommandMetadata,
  ApplicationCommandRoute,
  ContextType,
  RouterDecoratorOptions,
  SlashCommandMetadata,
  SlashCommandParameter,
  SubCommandMetadata,
  WatsonEvent,
} from '@watsonjs/common';
import { MethodDescriptor } from '@watsonjs/di';

export class ApplicationCommandRouteImpl
  extends RouteRef<WatsonEvent.INTERACTION_CREATE>
  implements ApplicationCommandRoute
{
  public commandType: any;
  public host: any;
  public parent: ApplicationCommandRoute | null;
  public commandId: string | null = null;

  public readonly configuration: ApplicationCommandConfiguration;

  public get name() {
    return this.configuration.name;
  }

  public params?: SlashCommandParameter[];

  public children: Map<string, ApplicationCommandRoute> | null = null;

  constructor(
    commandOptions:
      | SlashCommandMetadata
      | ApplicationCommandMetadata
      | SubCommandMetadata,
    routerOptions: RouterDecoratorOptions,
    router: RouterRef,
    handler: MethodDescriptor,
    parent?: ApplicationCommandRoute
  ) {
    super(ContextType.interaction, WatsonEvent.INTERACTION_CREATE, handler);
  }
}
