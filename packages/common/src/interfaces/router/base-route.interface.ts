import { WatsonEvent } from '../../enums';
import { ContextType } from '../pipeline';
import { Type } from '../type.interface';

export interface BaseRoute {
  /**
   * The type of the execution context
   * Execution contexts be either `"slash"`, `event` or `"command"`
   */
  getType<T extends string = ContextType>(): T;
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @Command, @Event
   */
  getHandler(): Function;
  /**
   * Returns the host receiver that
   * this route was registered in
   */
  getHost<T extends Type<any>>(): T;
  /**
   * Returns the internal DI container
   * which holds metadata, configurations as well
   * as instances for all components.
   *
   * @returns An instance of `WatsonContainer` which can be found in `@watsonjs/core`
   */
  getContainer<T = any>(): T;
  /**
   * Returns the event that this route is mapped to
   */
  getEvent(): WatsonEvent;
}
