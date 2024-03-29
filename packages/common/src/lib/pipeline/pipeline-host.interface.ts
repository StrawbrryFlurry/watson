import { BaseRoute } from '@common/router/base-route.interface';

import { CommandPipeline } from './command-pipeline.interface';
import { ContextType } from './context-type.enum';
import { EventPipeline } from './event-pipeline.interface';
import { InteractionPipeline } from './interaction-pipeline.interface';

/**
 * A `IPipelineHost` is a type that contains a
 * pipeline of any kind. Usually this will be an
 * execution context which in itself holds the
 * context of either a command, event or interaction
 * handler.
 */
export interface PipelineHost {
  /**
   * Returns the CommandPipeline for
   * this executions context.
   */
  switchToCommand(): CommandPipeline;
  /**
   * Returns the InteractionPipeline for
   * this executions context.
   */
  switchToInteraction(): InteractionPipeline;
  /**
   * Returns the EventPipeline for
   * this executions context.
   */
  switchToEvent(): EventPipeline<any>;
  /**
   * Returns the context type of this execution context
   */
  getType<T extends string = ContextType>(): T;
  /**
   * Returns the internal route
   * which was mapped to the event
   * handler
   */
  getRoute(): BaseRoute;
}
