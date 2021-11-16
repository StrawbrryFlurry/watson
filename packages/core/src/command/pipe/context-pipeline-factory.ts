import { RouteRef } from '@core/router';

import { InteractionPipelineImpl } from './interaction-pipe';

/**
 * Used to create instances of a given `ExecutionContextPipeline`
 * which serves as a representation of an event emitted by the
 * client and holds all information available for that event
 * and all additional data Watson accumulated during the
 * handling of that event so far.
 */
export class ContextPipelineFactory {
  public static create(routeRef: RouteRef) {
    switch (routeRef.type) {
      case "interaction": {
        return new InteractionPipelineImpl.create();
      }
    }
  }
}
