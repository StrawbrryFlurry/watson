import { Injector } from '@di/core/injector';

/**
 * Injector hook that is called after
 * the provider has been instantiated.
 */
export interface AfterResolution {
  afterResolution(injector: Injector): void;
}
