import { BaseRoute } from '../router';
import { CommandPipeline } from './command-pipeline.interface';
import { EventPipeline } from './event-pipeline.interface';
import { SlashPipeline } from './slash-pipeline.interface';

/** The type of a pipeline context */
export type ContextType = "command" | "event" | "slash";

/**
 * A `IPipelineHost` is a type that contains a
 * pipeline of any kind. Usually this will be an
 * execution context which in itself holds the
 * context of either a command, event or interaction
 * handler.
 */
export interface PipelineHost {
  /**
   * Returns the CommandPipelineHost class for
   * this executions context.
   */
  switchToCommand(): CommandPipeline;
  /**
   * Returns the SlashPipelineHost class for
   * this executions context.
   */
  switchToSlash(): SlashPipeline;
  /**
   * Returns the EventPipelineHost class for
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
