import { _Injector } from "@injector";
import { Providable } from "@watsonjs/common";

export class ContextInjector extends _Injector {
  public create<T>(...args: any[]): T {
    throw new Error("Method not implemented.");
  }

  public get<R = any, T = Providable>(typeOrToken: T): R {
    throw new Error("Method not implemented.");
  }
}
