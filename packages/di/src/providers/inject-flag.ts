import { INJECT_FLAG_METADATA } from '@di/constants';
import { Reflector } from '@di/core/reflector';
import { W_INJECT_FLAG } from '@di/fields';
import { Type } from '@di/types';
import { isFunction, isNil } from '@di/utils/common';

import type { CustomProviderDependency } from "@di/providers/custom-provider.interface";

export enum InjectFlag {
  None = 1 << 0,
  Inject = 1 << 1,
  Optional = 1 << 2,
  Self = 1 << 3,
  SkipSelf = 1 << 4,
  Host = 1 << 5,
  Lazy = 1 << 6,
}

export function getCustomProviderDependencyFlags(
  deps: CustomProviderDependency[]
): InjectFlag[] {
  return deps.map((dep: CustomProviderDependency) => {
    if (!Array.isArray(dep)) {
      return InjectFlag.None;
    }

    const [flags] = dep;

    if (Array.isArray(flags)) {
      const flag = flags.reduce(
        (acc: InjectFlag, flag) =>
          acc | (isFunction(flag) ? flag[W_INJECT_FLAG] : flag),
        InjectFlag.None
      );

      return flag ^ InjectFlag.None;
    }

    if (isFunction(flags)) {
      return flags();
    }

    return flags;
  });
}

export interface InjectFlagDecorator {
  (): ParameterDecorator;
  new (): InjectFlag;
}

export function makeInjectFlagDecorator(flag: InjectFlag): InjectFlagDecorator {
  const decoratorFn = (
    target: object | Type,
    parameterKey: string | symbol,
    parameterIndex: number
  ): void => {
    if (isNil(target)) {
      // Was called by the constructor
      return;
    }

    Reflector.mergeMetadata<number[]>(
      INJECT_FLAG_METADATA,
      target,
      (metadata: number[]) => {
        if (metadata.length === 0) {
          const depCount = Reflector.reflectCtorParameterCount(<Type>target);
          metadata.fill(InjectFlag.None, 0, depCount);
          metadata[parameterIndex] = flag;
          return metadata;
        }

        const existing = metadata[parameterIndex];

        if (existing === InjectFlag.None) {
          metadata[parameterIndex] = flag;
          return metadata;
        }

        metadata[parameterIndex] = existing | flag;
        return metadata;
      },
      []
    );
  };

  const decoratorFactory = function () {
    return decoratorFn;
  };

  decoratorFactory.prototype[W_INJECT_FLAG] = flag;

  return <InjectFlagDecorator>decoratorFactory;
}
