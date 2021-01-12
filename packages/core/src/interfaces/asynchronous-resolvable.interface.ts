import { Observable } from 'rxjs';

export type IAsynchronousResolvable<T = any> = Promise<T> | Observable<T> | T;
