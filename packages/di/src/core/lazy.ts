import { Binding } from '@di/core/binding';
import { Injector } from '@di/core/injector';
import { isNil } from '@di/utils/common';

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
