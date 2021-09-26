import { Injector } from '@di';
import { RuntimeException } from '@watsonjs/common';
import { stringify } from 'querystring';

export class NullInjector implements Injector {
  public parent: null;

  get(typeTokenOrProvider: any) {
    throw new RuntimeException(
      `NullInjectorError: No provider for ${stringify(typeTokenOrProvider)}!`
    );
  }
}
