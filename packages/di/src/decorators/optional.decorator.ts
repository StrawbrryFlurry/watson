import { OPTIONAL_DEPENDENCY_METADATA } from "@di/constants";
import { Reflector } from "@di/core/reflector";
import { Type } from "@di/types";

export interface OptionalInjectMetadata {}

export function Optional(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const metadata: OptionalInjectMetadata = {
      parameterIndex,
    };

    const existingMetadata = Reflector.reflectMetadata<
      OptionalInjectMetadata[]
    >(OPTIONAL_DEPENDENCY_METADATA, <Type>target);

    const concatenatedMetadata = [...existingMetadata, metadata];

    Reflect.defineMetadata(
      OPTIONAL_DEPENDENCY_METADATA,
      concatenatedMetadata,
      target
    );
  };
}
