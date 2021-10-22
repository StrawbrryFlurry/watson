import { BaseRoute } from '../router';
import { CommandPipeline } from './command-pipeline.interface';
import { EventPipeline } from './event-pipeline.interface';
import { InteractionPipeline } from './interaction-pipeline.interface';

/** The type of a pipeline context */
export type ContextType = "command" | "event" | "interaction";

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
  switchToEvent(): EventPipeline;
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
