import { isCustomProvider, ProviderResolvable } from '@di';
import { BootstrapException } from '@exceptions';
import {
  DEFAULT_LIFETIME,
  DEFAULT_SCOPE,
  DESIGN_PARAMETERS,
  DESIGN_RETURN_TYPE,
  DESIGN_TYPE,
  INJECTABLE_METADATA,
  InjectableOptions,
  InjectorLifetime,
  isNil,
  ProvidedInScope,
  Type,
  WATSON_PROV_LIFETIME,
  WATSON_PROV_SCOPE,
} from '@watsonjs/common';

export interface MethodDescriptor {
  propertyKey: string;
  descriptor: Function;
}

export class Reflector {
  /** {@link DESIGN_PARAMETERS} */
  public static reflectMethodParameters<T extends unknown[] = unknown[]>(
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
        descriptor: descriptor.value,
      })
    );

    return methodDescriptors;
  }

  public static reflectProviderScope(
    typeOrProvider: ProviderResolvable
  ): Required<InjectableOptions> {
    let lifetime: InjectorLifetime | undefined;
    let scope: ProvidedInScope | undefined;

    if (isCustomProvider(typeOrProvider)) {
      const { provide } = typeOrProvider;

      scope = provide[WATSON_PROV_LIFETIME];
      lifetime = provide[WATSON_PROV_SCOPE];
    } else {
      const metadata = Reflector.reflectMetadata<InjectableOptions>(
        INJECTABLE_METADATA,
        typeOrProvider
      );

      lifetime = typeOrProvider[WATSON_PROV_LIFETIME] ?? metadata?.lifetime;
      scope = typeOrProvider[WATSON_PROV_SCOPE] ?? metadata?.providedIn;
    }

    lifetime ??= DEFAULT_LIFETIME;
    scope ??= DEFAULT_SCOPE;

    return {
      lifetime,
      providedIn: scope,
    } as Required<InjectableOptions>;
  }

  /**
   * Returns metadata defined
   * on `metatype` with key`key`.
   * Optionally takes a `propertyKey`
   * for object-property metadata.
   */
  public static reflectMetadata<T>(
    key: string,
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(key, metatype, propertyKey!) as T;
  }
}
