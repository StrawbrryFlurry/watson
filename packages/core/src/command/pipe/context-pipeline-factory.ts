import { CommandRouteImpl } from '@core/router';
import {
  ApplicationCommandRoute,
  BaseRoute,
  CommandRoute,
  CtorParameters,
  EventRoute,
  OmitFirstElement,
} from '@watsonjs/common';
import { Injector } from '@watsonjs/core';

import { CommandPipelineImpl } from '.';
import { EventPipelineImpl } from './event-pipeline';
import { InteractionPipelineImpl } from './interaction-pipe';

type RoutePipeMap<T extends BaseRoute> = T extends ApplicationCommandRoute
  ? [InteractionPipelineImpl, typeof InteractionPipelineImpl]
  : T extends CommandRoute
  ? [CommandPipelineImpl, typeof CommandPipelineImpl]
  : T extends EventRoute
  ? [EventPipelineImpl, typeof EventPipelineImpl]
  : never;

/**
 * Used to create instances of a given `ExecutionContextPipeline`
 * which serves as a representation of an event emitted by the
 * client and holds all information available for that event
 * and all additional data Watson accumulated during the
 * handling of that event so far.
 */
export class ContextPipelineFactory {
  constructor(private _injector: Injector) {}

  public create<
    R extends BaseRoute,
    PipeMatch extends RoutePipeMap<R>,
    Pipe extends PipeMatch[0],
    PipeCtor extends CtorParameters<PipeMatch[1]>,
    O extends OmitFirstElement<PipeCtor>
  >(routeRef: R, ...options: O): Pipe {
    // We can only use the spread operator on tuples
    const o = options as any as [any, any];

    switch (routeRef.type) {
      case "interaction": {
        return InteractionPipelineImpl.create(
          routeRef as any as ApplicationCommandRoute,
          ...o
        ) as any as Pipe;
      }
      case "event": {
        return InteractionPipelineImpl.create(
          routeRef as any as ApplicationCommandRoute,
          ...o
        ) as any as Pipe;
      }
      case "command": {
        return InteractionPipelineImpl.create(
          routeRef as any as ApplicationCommandRoute,
          ...o
        ) as any as Pipe;
      }
    }

    return "" as any;
  }
}

declare const a: CommandRoute;
declare const ab: ApplicationCommandRoute;
declare const ac: EventRoute;

declare const c: CtorParameters<typeof CommandRouteImpl>;
declare const b: CtorParameters<RoutePipeMap<typeof a>[1]>;

declare const cpf: ContextPipelineFactory;

cpf.create(a);
cpf.create(ab);
cpf.create(ac);
