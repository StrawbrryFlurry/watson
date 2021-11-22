import { WatsonEvent } from '@common/enums';

import { ContextType } from '../pipeline';
import { Type } from '../type.interface';

export interface BaseRoute {
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @core/command, @Event
   */
  handler: Function;
  /**
   * Returns the host router that
   * this route was registered in
   */
  host: any;
  /**
   * The type of the execution context
   * Execution contexts be either `"interaction"`, `event` or `"command"`
   */
  type: string;
  /**
   * Returns the event that this route is mapped to
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
