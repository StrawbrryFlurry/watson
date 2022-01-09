import { isNil } from '@di/utils/common';

import type { LazyProvided } from "@di/types";

/**
 * Internal wrapper for a provider that
 * is lazily provided. A proxied instance
 * of this class is then provided to the
 * inquirer which can use asynchronous getters
 * to either resolve the lazy provider
 * or access it's properties.
 *
 * @See {@link LazyProvided}
 */
export class ɵLazy<T = any> {
  private _factory!: () => Promise<T>;
  public instance: T | null = null;

  constructor(factory: () => Promise<T>) {
    this._factory = factory;
  }

  public async get(): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    const instance = await this._factory();
    this.instance = instance;
    return instance;
  }
}

declare const _: LazyProvided<any>;
