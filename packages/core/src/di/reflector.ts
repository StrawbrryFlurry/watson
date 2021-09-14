import { BootstrapException } from '@exceptions';
import { DESIGN_PARAMETERS, DESIGN_RETURN_TYPE, DESIGN_TYPE, isNil, Type } from '@watsonjs/common';

export interface MethodDescriptor {
  propertyKey: string;
  value: Function;
}

export class Reflector {
  /** {@link DESIGN_PARAMETERS} */
  public reflectMethodParameters<T extends unknown[] = unknown[]>(
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(DESIGN_PARAMETERS, metatype, propertyKey!) || [];
  }

  /** {@link DESIGN_RETURN_TYPE} */
  public reflectMethodReturnType<T>(
    metatype: Type,
    propertyKey: string
  ): Type<T> {
    return Reflect.getMetadata(DESIGN_RETURN_TYPE, metatype, propertyKey);
  }

  /** {@link DESIGN_TYPE} */
  public reflectPropertyType<T>(metatype: Type, propertyKey: string): Type<T> {
    return Reflect.getMetadata(DESIGN_TYPE, metatype, propertyKey);
  }

  /**
   * Reflects all methods of a given type
   * from its prototype. The constructor
   * descriptor will be ignored.
   */
  public reflectMethodsOfType(metatype: Type): MethodDescriptor[] {
    if (isNil(metatype)) {
      throw new BootstrapException(
        "Reflector",
        "Failed to reflect methods of type as it is `null`"
      );
    }

    const prototype = Object.getPrototypeOf(metatype);

    if (isNil(prototype)) {
      throw new BootstrapException(
        "Reflector",
        `Failed to reflect methods of type ${metatype.name} as it does not have a valid prototype`
      );
    }

    const { constructor, ...descriptors } =
      Object.getOwnPropertyDescriptors(prototype);

    const methodDescriptors = Object.entries(descriptors).map(
      ([propertyKey, descriptor]) => ({
        propertyKey,
        value: descriptor.value,
      })
    );

    return methodDescriptors;
  }

  /**
   * Returns metadata defined
   * on `metatype` with key`key`.
   * Optionally takes a `propertyKey`
   * for object-property metadata.
   */
  public reflectMetadata<T>(
    key: string,
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(key, metatype, propertyKey!) as T;
  }
}
