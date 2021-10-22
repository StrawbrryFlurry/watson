import { Injector } from '@core/di';
import { isNil, Providable, RuntimeException, stringify } from '@watsonjs/common';

export class NullInjector implements Injector {
  public parent: null;

  public async get(
    typeTokenOrProvider: Providable,
    notFoundValue: any
  ): Promise<any> {
    if (!isNil(notFoundValue)) {
      return notFoundValue;
    }

    throw new RuntimeException(
      `NullInjectorError: No provider for ${stringify(typeTokenOrProvider)}!`
    );
  }
}
