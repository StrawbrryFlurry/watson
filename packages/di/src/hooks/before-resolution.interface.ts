import { Injector } from "@di/core/injector";
import { InjectorInquirerContext } from "@di/core/inquirer-context";
import { Constructable, CtorParameters } from "@di/types";
import { Observable } from "rxjs";

export interface BeforeResolution<T extends Constructable> {
  beforeResolution<D extends CtorParameters<T> = CtorParameters<T>>(
    injector: Injector,
    dependencies: D,
    inquirerContext: InjectorInquirerContext
  ): D | Promise<D> | Observable<D>;
}
