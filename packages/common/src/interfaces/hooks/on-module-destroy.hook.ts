import { Observable } from 'rxjs';

/**
 * The `onModuleDestroy` method on a watson component is called before it's host module is unmounted from the application
 */
export interface OnModuleDestroy {
  onModuleDestroy(): void | Promise<void> | Observable<void>;
}
