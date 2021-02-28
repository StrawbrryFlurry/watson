import { Observable } from 'rxjs';

import { CommandArgument } from '../command';

/**
 *
 *
 *
 *
 */
export interface PipeTransform<T extends CommandArgument = any, R = any> {
  transform(argument: T): R | Promise<R> | Observable<R>;
}
