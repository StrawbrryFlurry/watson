import {
  ApplicationCommandRoute,
  BaseRoute,
  CommandRoute,
  EventRoute,
  MessageMatchResult,
  OmitFirstElement,
} from '@watsonjs/common';
import { Injector } from '@watsonjs/di';
import { Message } from 'discord.js';

import { CommandPipelineImpl } from './command-pipe';
import { EventPipelineImpl } from './event-pipeline';
import { InteractionPipelineImpl } from './interaction-pipe';

type RoutePipeMap<T extends BaseRoute> = T extends ApplicationCommandRoute
  ? [InteractionPipelineImpl, typeof InteractionPipelineImpl]
  : T extends CommandRoute
  ? [CommandPipelineImpl, typeof CommandPipelineImpl]
  : T extends EventRoute
  ? [EventPipelineImpl<any>, typeof EventPipelineImpl]
  : never;

type CreatePipelineArguments<T extends { create: any }> = T["create"] extends (
  ...args: infer Args
) => any
  ? Args
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
    PipeCreateFnArgs extends CreatePipelineArguments<PipeMatch[1]>,
    O extends OmitFirstElement<OmitFirstElement<PipeCreateFnArgs>>
  >(routeRef: R, moduleInjector: Injector, ...options: O): Promise<Pipe> {
    // We can only use the spread operator on tuples
    const o = <any>options;

    switch (routeRef.type) {
      case "command": {
        return CommandPipelineImpl.create(
          routeRef as any as CommandRoute,
          moduleInjector,
          ...(o as [Message, MessageMatchResult])
        ) as any;
      }
      case "interaction": {
        return InteractionPipelineImpl.create(
          routeRef as any as ApplicationCommandRoute,
          moduleInjector,
          ...(o as [any])
        ) as any;
      }
      case "event": {
        return EventPipelineImpl.create(
          routeRef as any as EventRoute,
          moduleInjector,
          ...(o as [unknown[]])
        ) as any;
      }
    }

    throw `Could not find a matching route type for [RouteRef]: ${routeRef.metatype.name}`;
  }
}
