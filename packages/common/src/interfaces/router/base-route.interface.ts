import { Type } from '..';
import { WatsonEvent } from '../../enums';
import { ContextType } from '../pipeline';

export interface BaseRoute {
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @core/command, @Event
   */
  handler: Function;
  /**
   * Returns the host receiver that
   * this route was registered in
   */
  host: any;
  /**
   * The type of the execution context
   * Execution contexts be either `"slash"`, `event` or `"command"`
   */
  type: string;
  /**
   * Returns the event that this route is mapped to
   */
  event: WatsonEvent;
  metatype: Type;
  /**
   * The type of the execution context
   * Execution contexts be either `"slash"`, `event` or `"command"`
   */
  getType<T extends string = ContextType>(): T;
  /**
   * Returns the event that this route is mapped to
   */
  getEvent(): WatsonEvent;
}
