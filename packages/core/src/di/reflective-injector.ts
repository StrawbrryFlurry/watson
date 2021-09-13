import { Injector } from './injector';

export class ReflectiveInjector extends Injector {
  constructor() {
    super();
  }

  public create<T extends unknown>(...args: any[]): T {
    throw new Error("Method not implemented.");
  }

  public get(typeOrToken: any) {
    throw new Error("Method not implemented.");
  }
}
