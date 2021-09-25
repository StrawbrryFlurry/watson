import { OPTIONAL_DEPENDENCY_METADATA } from '@constants';
import { applyStackableMetadata } from '@decorators';

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

    applyStackableMetadata(
      OPTIONAL_DEPENDENCY_METADATA,
      target,
      [metadata],
      propertyKey
    );
  };
}
