import { RuntimeException } from '@common/exceptions';
import { Observable } from 'rxjs';

export interface ExceptionHandler {
  catch(exception: RuntimeException): void | Promise<void> | Observable<void>;
}
