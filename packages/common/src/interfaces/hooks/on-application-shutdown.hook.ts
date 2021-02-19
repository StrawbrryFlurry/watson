import { Observable } from 'rxjs';

/**
 * The `onApplicationShutdown` method on a watson component is called just before the process exits
 */
export interface OnApplicationShutdown {
  onApplicationShutdown(): void | Promise<void> | Observable<void>;
}
