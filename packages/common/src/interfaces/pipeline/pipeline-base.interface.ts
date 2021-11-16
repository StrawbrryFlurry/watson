import { BaseRoute, ContextType } from '..';

export interface PipelineBase<T extends BaseRoute = any> {
  /** The Watson pipeline type */
  contextType: ContextType;
  /**
   * The route that matched with
   * the event emitted.
   */
  route: T;
  /**
   * Returns the raw data emitted by the
   * client.
   *
   * ```
   * client.on("message", (\/* "Event Data" *\/) => {})
   * ```
   */
  getEvent<T extends unknown = unknown[]>(): T;
  /**
   * Returns the context injector of
   * this pipeline context.
   */
  getInjector<T = any>(): T;
}
