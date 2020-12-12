import {
  IInjectableOptions,
  INJECTABLE_OPTIONS_METADATA,
  IReceiverOptions,
  MODULE_IMPORT_METADTA,
  MODULE_PROVIDER_METADTA,
  MODULE_RECEIVER_METADTA,
  RECEIVER_OPTIONS_METADATA,
  Type,
} from '@watson/common';

export class MetadataResolver {
  public resolveInjectableMetadata(target: Object): IInjectableOptions {
    return Reflect.getMetadata(
      INJECTABLE_OPTIONS_METADATA,
      target
    ) as IInjectableOptions;
  }

  public resolveMethodPrams(
    target: Object,
    propertyKey: string | symbol
  ): unknown[] {
    return Reflect.getMetadata("design:paramtypes", target, propertyKey);
  }

  public resolveConstructorParams(target: Object): Type[] {
    return Reflect.getMetadata("design:paramtyps", target);
  }

  public resolveModuleMetadata(target: Object) {
    const imports = Reflect.getMetadata(
      MODULE_IMPORT_METADTA,
      target
    ) as Type[];
    const providers = Reflect.getMetadata(
      MODULE_PROVIDER_METADTA,
      target
    ) as Type[];
    const receivers = Reflect.getMetadata(
      MODULE_RECEIVER_METADTA,
      target
    ) as Type[];

    return {
      imports,
      providers,
      receivers,
    };
  }
  public resolveComponentMetadata(target: Object): IReceiverOptions {
    return Reflect.getMetadata(
      RECEIVER_OPTIONS_METADATA,
      target
    ) as IReceiverOptions;
  }
}
