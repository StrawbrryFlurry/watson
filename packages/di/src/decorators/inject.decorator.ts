import { INJECT_DEPENDENCY_METADATA } from '@di/constants';
import { InjectionToken } from '@di/providers';
import { Type } from '@di/types';

export interface InjectMetadata {
  propertyKey: string | symbol;
  parameterIndex: number;
  provide: Type | InjectionToken;
}

/**
 * Injects a dependency into the argument
 * of a class constructor.
 *
 * Note that this decorator cannot be used
 * in class methods.
 */
export function Inject(token: Type | InjectionToken): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const metadata: InjectMetadata = {
      provide: token,
      propertyKey: propertyKey,
      parameterIndex: parameterIndex,
    };

    const existingMetadata =
      <InjectMetadata[]>(
        Reflect.getMetadata(INJECT_DEPENDENCY_METADATA, <Type>target)
      ) ?? [];

    const concatenatedMetadata = [...existingMetadata, metadata];

    Reflect.defineMetadata(
      INJECT_DEPENDENCY_METADATA,
      concatenatedMetadata,
      target
    );
  };
}
