import { Observable } from 'rxjs';

import { PipelineHost } from '../pipeline';

/**
 *
 *
 *
 *
 */
export interface PipeTransform<T extends PipelineHost = any> {
  transform(
    ctxData: T
  ): Partial<T> | Promise<Partial<T>> | Observable<Partial<T>>;
}
