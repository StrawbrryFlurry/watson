import { Observable } from 'rxjs';

/**
 * The `onApplicationBootstrap` method on a watson component is called after the module initialization has finished
 */
export interface OnApplicationBootstrap {
  onApplicationBootstrap(): void | Promise<void> | Observable<void>;
}
