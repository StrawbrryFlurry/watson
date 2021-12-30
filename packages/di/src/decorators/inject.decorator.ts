import { INJECT_DEPENDENCY_METADATA } from '@di/constants';
import { InjectionToken } from '@di/providers/injection-token';
import { Type } from '@di/types';

export interface InjectMetadata {
  propertyKey: string | symbol;
  parameterIndex: number;
  provide: Type | InjectionToken;
}

/**
 * Injects an instance for `token` into the
 * decorated parameter of a class constructor.
 *
 * This decorator doesn't do anything in
 * class methods. That behavior is to be
 * implemented by other framework specific
 * tools.
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
