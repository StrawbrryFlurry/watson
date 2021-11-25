import { MethodDescriptor, RouterRef } from '@core/di';
import { ApplicationCommandParameter, ApplicationCommandRoute, RouterDecoratorOptions, WatsonEvent } from '@watsonjs/common';

import { ApplicationCommandConfig } from '.';
import { RouteRef } from '..';

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
    super("interaction", WatsonEvent.INTERACTION_CREATE);
  }
}
