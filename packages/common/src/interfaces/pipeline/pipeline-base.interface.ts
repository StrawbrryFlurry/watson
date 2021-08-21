import { ContextType } from '..';

export interface PipelineBase {
  contextType: ContextType;
  getEvent<T extends unknown[] = unknown[]>(): T;
}
