import { BootstrapException } from '@exceptions';
import { DESIGN_PARAMETERS, DESIGN_RETURN_TYPE, isNil, Type } from '@watsonjs/common';

export interface MethodDescriptor {
  propertyKey: string;
  value: Function;
}

export class Reflector {
  public reflectMethodParameters<T extends unknown[] = unknown[]>(
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(DESIGN_PARAMETERS, metatype, propertyKey) || [];
  }

  public reflectMethodReturnType(metatype: Type, propertyKey: string) {
    Reflect.getMetadata(DESIGN_RETURN_TYPE, metatype, propertyKey);
  }

  /**
   * Reflects all methods of a given type
   * from its prototype. The constructor
   * descriptor will be ignored.
   */
  public reflectMethodsOfType(metatype: Type): MethodDescriptor[] {
    const { prototype } = metatype;

    if (isNil(prototype)) {
      throw new BootstrapException(
        "Reflector",
        `Failed to reflect methods of type ${metatype.name} as it does not have a valid prototype`
      );
    }

    const { constructor, ...descriptors } =
      Object.getOwnPropertyDescriptors(prototype);

    const descriptorValues = Object.entries(descriptors).map(
      ([propertyKey, descriptor]) => ({
        propertyKey,
        value: descriptor.value,
      })
    );

    return descriptorValues;
  }

  public reflectMetadata<T>(
    key: string,
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(key, metatype, propertyKey) as T;
  }
}
