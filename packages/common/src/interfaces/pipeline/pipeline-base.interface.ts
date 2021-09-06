import { ContextType } from '..';

export interface PipelineBase {
  contextType: ContextType;
  getEvent<T extends unknown[] = unknown[]>(): T;
  /**
   * Returns the context injector of
   * this pipeline context.
   */
  getInjector<T = any>(): T;
}
