import { OPTIONAL_DEPENDENCY_METADATA } from '@common/constants';
import { applyStackableMetadata } from '@common/decorators';

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
