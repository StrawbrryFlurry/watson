import { RouterRefImpl } from "@core/di";
import {
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  IsInterceptor,
  isNil,
  PIPE_METADATA,
  PREFIX_METADATA,
} from "@watsonjs/common";
import {
  DeclareModuleRef,
  Injector,
  ModuleDef,
  ModuleRef,
  Reflector,
  Type,
  UniqueTypeArray,
} from "@watsonjs/di";

import { ComponentFactory } from "./component-factory";

@DeclareModuleRef()
export class ModuleImpl extends ModuleRef {
  public componentFactory: ComponentFactory;

  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super(metatype, rootInjector, parent, moduleDef, RouterRefImpl);
  }

  private _reflectAllComponentInjectables(metatype: Type) {
    const injectables = new UniqueTypeArray<IsInterceptor>();

    if (isNil(metatype) || isNil(metatype.prototype)) {
      return injectables;
    }

    this._reflectComponentInjectable(metatype, injectables, GUARD_METADATA);
    this._reflectComponentInjectable(metatype, injectables, PIPE_METADATA);
    this._reflectComponentInjectable(metatype, injectables, FILTER_METADATA);
    this._reflectComponentInjectable(
      metatype,
      injectables,
      EXCEPTION_HANDLER_METADATA
    );
    this._reflectComponentInjectable(metatype, injectables, PREFIX_METADATA);

    return injectables;
  }

  private _reflectComponentInjectable(
    metatype: Type,
    ctx: UniqueTypeArray<IsInterceptor>,
    metadataKey: string
  ) {
    const prototypeInjectables =
      Reflector.reflectMetadata<any[]>(metadataKey, metatype) ?? [];

    const prototypeMethods = Reflector.reflectMethodsOfType(metatype);

    const methodInjectables = prototypeMethods
      .map(
        (method) =>
          Reflector.reflectMetadata<any[]>(metadataKey, method.descriptor) ?? []
      )
      .filter((e) => !isNil(e));

    const injectables = [...prototypeInjectables, ...methodInjectables.flat()];

    ctx.add(...injectables);
  }
}
