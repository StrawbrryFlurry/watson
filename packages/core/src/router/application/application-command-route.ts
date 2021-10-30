import { WatsonEvent } from 'packages/common/src/enums';

import { ApplicationCommandConfig } from '.';
import { RouterRef } from '../router';

export class ApplicationCommandRouteImpl extends RouterRef<WatsonEvent.INTERACTION_CREATE> {
  public readonly configuration: ApplicationCommandConfig;

  public get name() {
    return this.config.name;
  }
}

// TODO
// export class SlashRoute extends RouteRef<WatsonEvent.INTERACTION_CREATE> {
//   public handler: Function;
//   public host: InstanceWrapper<ReceiverDef>;
//   public config: SlashConfiguration;
//
//   constructor(
//     config: any,
//     receiver: InstanceWrapper<ReceiverDef>,
//     handler: Function,
//     container: WatsonContainer
//   ) {
//     super("slash", WatsonEvent.INTERACTION_CREATE, container);
//
//     this.host = receiver;
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
