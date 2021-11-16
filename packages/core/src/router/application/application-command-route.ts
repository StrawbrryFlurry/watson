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

// TODO
// export class SlashRoute extends RouteRef<WatsonEvent.INTERACTION_CREATE> {
//   public handler: Function;
//   public host: InstanceWrapper<RouterDef>;
//   public config: SlashConfiguration;
//
//   constructor(
//     config: any,
//     router: InstanceWrapper<RouterDef>,
//     handler: Function,
//     container: WatsonContainer
//   ) {
//     super("slash", WatsonEvent.INTERACTION_CREATE, container);
//
//     this.host = router;
//     this.handler = handler;
//     this.config = new SlashConfiguration(config);
//   }
//
//   public matchEvent(...eventArgs: unknown[]): IAsynchronousResolvable<boolean> {
//     throw new Error("Method not implemented.");
//   }
//
//   public createContextData(...eventArgs: unknown[]) {
//     throw new Error("Method not implemented.");
//   }
//
//   public get name() {
//     return this.config.name;
//   }
// }
