import { MethodDescriptor } from '@core/di';
import { RouterRef } from '@core/router/application-router';
import { RouteRef } from '@core/router/route-ref';
import {
  ApplicationCommandParameter,
  ApplicationCommandRoute,
  ContextType,
  RouterDecoratorOptions,
  WatsonEvent,
} from '@watsonjs/common';

import { ApplicationCommandConfig } from './application-command-config';

export class ApplicationCommandRouteImpl
  extends RouteRef<WatsonEvent.INTERACTION_CREATE>
  implements ApplicationCommandRoute
{
  public commandType: any;
  public handler: Function;
  public host: any;
  public parent: ApplicationCommandRoute | null;

  public readonly configuration: ApplicationCommandConfig;

  public get name() {
    return this.configuration.name;
  }

  public params?: ApplicationCommandParameter[];

  constructor(
    commandOptions: ApplicationCommandConfig,
    routerOptions: RouterDecoratorOptions,
    router: RouterRef,
    handler: MethodDescriptor,
    parent?: ApplicationCommandRoute
  ) {
    super(ContextType.interaction, WatsonEvent.INTERACTION_CREATE);
  }
}
