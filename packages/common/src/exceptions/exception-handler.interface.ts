import { Observable } from 'rxjs';

import { RuntimeException } from './runtime-exception';

export interface ExceptionHandler {
  catch(exception: RuntimeException): void | Promise<void> | Observable<void>;
}
