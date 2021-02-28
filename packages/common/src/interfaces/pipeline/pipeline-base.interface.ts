import { ContextType } from './pipeline-host.interface';

export interface PipelineBase {
  contextType: ContextType;

  getEvent<T extends unknown[] = unknown[]>(): T;
}
