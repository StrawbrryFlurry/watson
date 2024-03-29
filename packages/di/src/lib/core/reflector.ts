import { DESIGN_PARAMETERS, DESIGN_RETURN_TYPE, DESIGN_TYPE, INJECT_DEPENDENCY_METADATA } from '@di/constants';
import { resolveForwardRef } from '@di/providers/forward-ref';
import { Type } from '@di/types';
import { isEmpty, isNil } from '@di/utils/common';

import type { InjectMetadata } from "@di/providers/inject-flag";
import type { InjectionToken } from "@di/providers/injection-token";

export interface MethodDescriptor {
  propertyKey: string;
  descriptor: Function;
}

/**
 * Helper class for `reflect-metadata` proving
 * commonly used reflection features.
 */
export class Reflector {
  /** {@link DESIGN_PARAMETERS} */
  public static reflectMethodParameters<T extends unknown[] = Type[]>(
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(DESIGN_PARAMETERS, metatype, propertyKey!) || [];
  }

  /** {@link DESIGN_RETURN_TYPE} */
  public static reflectMethodReturnType<T>(
    metatype: Type,
    propertyKey: string
  ): Type<T> {
    return Reflect.getMetadata(DESIGN_RETURN_TYPE, metatype, propertyKey);
  }

  /** {@link DESIGN_TYPE} */
  public static reflectPropertyType<T>(
    metatype: Type,
    propertyKey: string
  ): Type<T> {
    return Reflect.getMetadata(DESIGN_TYPE, metatype, propertyKey);
  }

  /**
   * Reflects all methods of a given type
   * from its prototype. The constructor
   * descriptor will be ignored.
   */
  public static reflectMethodsOfType(metatype: Type): MethodDescriptor[] {
    if (isNil(metatype)) {
      throw "Failed to reflect methods of type as it is `null`";
    }

    const { prototype } = metatype;

    if (isNil(prototype)) {
      throw `Failed to reflect methods of type ${metatype.name} as it does not have a valid prototype`;
    }

    const { constructor, ...descriptors } =
      Object.getOwnPropertyDescriptors(prototype);

    const methodDescriptors = Object.entries(descriptors).map(
      ([propertyKey, descriptor]) => ({
        propertyKey,
        descriptor: descriptor.value,
      })
    );

    return methodDescriptors ?? [];
  }

  /**
   * Returns metadata defined
   * on `metatype` with key`key`.
   * Optionally takes a `propertyKey`
   * for object-property metadata.
   */
  public static reflectMetadata<
    T,
    V extends T | null = T | null,
    R = V extends null ? T | null : V
  >(
    key: string,
    metatype: Type | object,
    propertyKey?: string | symbol | null,
    notFoundValue: V = <V>null
  ): R {
    return <R>(
      (Reflect.getMetadata(key, metatype, <string>propertyKey ?? undefined) ??
        notFoundValue)
    );
  }

  public static mergeMetadata<T>(
    key: string,
    metatype: Type | object,
    cb: (metadata: T) => T,
    notFoundValue: T | null = null,
    propertyKey?: string | symbol | null
  ): void {
    const property: string = <string>propertyKey ?? undefined;
    const existingMetadata = Reflector.reflectMetadata<T>(
      key,
      metatype,
      property,
      notFoundValue
    );
    const merged = cb(<T>existingMetadata);
    Reflect.defineMetadata(key, merged, metatype, property);
  }

  public static reflectCtorParameterCount(type: Type): number {
    return this.reflectMethodParameters<Type[]>(type).length;
  }

  /**
   * Reflects the constructor argument types
   * for `type`. Additionally checks for
   * `@Inject` metadata for injecting InjectionTokens
   * in a constructor.
   */
  public static reflectCtorArgs(type: Type): (Type | InjectionToken)[] {
    const deps = this.reflectMethodParameters<(Type | InjectionToken)[]>(type);

    if (isNil(deps) || isEmpty(deps)) {
      return [];
    }

    const injectParameters =
      this.reflectMetadata<InjectMetadata[]>(
        INJECT_DEPENDENCY_METADATA,
        type
      ) ?? [];

    for (let i = 0; i < injectParameters.length; i++) {
      const injectMetadata = injectParameters[i];
      const { parameterIndex, inject } = injectMetadata;

      deps[parameterIndex] = resolveForwardRef(inject);
    }

    return deps;
  }
}
