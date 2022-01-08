import { WatsonEvent } from '@common/enums';
import { ContextType } from '@common/pipeline/context-type.enum';
import { Type } from '@watsonjs/di';

export interface BaseRoute {
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @core/command, @Event
   */
  handler: Function;
  /**
   * The name of the handler method.
   */
  propertyKey: string;
  /**
   * The host router that this route was registered in
   */
  host: any;
  /**
   * The type of the Execution
   * context:
   * - "slash"
   * - "event"
   * - "command"
   */
  type: string;
  /**
   * The event type this route will map to
   * @example
   * `WatsonEvent.MESSAGE_CREATE`
   */
  event: WatsonEvent;
  metatype: Type;
  /**
   * The type of the execution context
   * Execution contexts be either `"interaction"`, `event` or `"command"`
   */
  getType<T extends string = ContextType>(): T;
  /**
   * Returns the event that this route is mapped to
   */
  getEvent(): WatsonEvent;
}
