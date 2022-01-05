import { Binding } from '@di/core/binding';
import { Injector } from '@di/core/injector';
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
  private _binding: Binding;
  private _ctx: Injector | null;

  constructor(
    binding: Binding,
    ctx: Injector | null,
    factory: () => Promise<T>
  ) {
    this._factory = factory;
    this._binding = binding;
    this._ctx = ctx;
  }

  public async get(): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    const instance = await this._factory();
    this._binding.setInstance(instance, this._ctx);
    this.instance = instance;
    return instance;
  }
}

declare const _: LazyProvided<any>;
