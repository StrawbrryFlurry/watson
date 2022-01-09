import { Providable } from '@di/providers/injection-token';
import { stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

import type { Injector } from "./injector";

export class NullInjector implements Injector {
  public parent: null = null;

  public async get(
    typeTokenOrProvider: Providable,
    notFoundValue?: any
  ): Promise<any> {
    if (!isNil(notFoundValue)) {
      return notFoundValue;
    }

    throw `NullInjectorError: No provider for ${stringify(
      typeTokenOrProvider
    )}`;
  }
}
