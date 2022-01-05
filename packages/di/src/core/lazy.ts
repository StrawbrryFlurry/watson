export class ɵLazy<T = any> {
  private _factory!: () => Promise<T>;
  public instance: T | null = null;

  constructor(factory: () => Promise<T>) {
    this._factory = factory;
  }

  public async get() {
    const instance = await this._factory();
    this.instance = instance;
    return instance;
  }
}
