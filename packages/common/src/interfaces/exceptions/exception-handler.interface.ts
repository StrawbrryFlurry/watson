import { RuntimeException } from '@exceptions';
import { Observable } from 'rxjs';

export interface ExceptionHandler {
  catch(exception: RuntimeException): void | Promise<void> | Observable<void>;
}
