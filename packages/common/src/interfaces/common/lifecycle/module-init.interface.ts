import { Observable } from 'rxjs';

/**
 * The `onModuleInit` method on a watson component is called after its host module was initialized
 */
export interface OnModuleInit {
  onModuleInit(): void | Promise<void> | Observable<void>;
}
