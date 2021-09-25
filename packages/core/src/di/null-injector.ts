import { Injector } from '@di';
import { RuntimeException } from 'packages/common/src/exceptions';
import { stringify } from 'querystring';

export class NullInjector implements Injector {
  public parent: null;

  resolve(typeTokenOrProvider: any) {
    throw new RuntimeException(
      `NullInjectorError: No provider for ${stringify(typeTokenOrProvider)}!`
    );
  }
}
