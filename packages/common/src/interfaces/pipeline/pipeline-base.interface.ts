import { BaseRoute, ContextType } from '..';

export interface PipelineBase<
  D extends unknown = any,
  T extends BaseRoute = any
> {
  /** The Watson pipeline type */
  contextType: ContextType;
  /**
   * The route that matched with
   * the event emitted.
   */
  route: T;
  /** The raw event data emitted by the client */
  eventData: D;
  /**
   * Returns the raw data emitted by the
   * client.
   *
   * ```
   * client.on("message", (\/* "Event Data" *\/) => {})
   * ```
   */
  getEvent(): D;
  /**
   * Returns the context injector of
   * this pipeline context.
   */
  getInjector<T = any>(): T;
}
