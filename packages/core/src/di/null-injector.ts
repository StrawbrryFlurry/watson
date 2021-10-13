import { Binding, Injector } from '@di';
import { isNil, Providable, RuntimeException, stringify, W_BINDING_DEF } from '@watsonjs/common';

export class NullInjector implements Injector {
  public parent: null;

  public async get(typeTokenOrProvider: Providable): Promise<any> {
    const bindingDef = typeTokenOrProvider[W_BINDING_DEF] as
      | Binding
      | undefined;
    const t = () => {
      throw new RuntimeException(
        `NullInjectorError: No provider for ${stringify(typeTokenOrProvider)}!`
      );
    };

    if (isNil(bindingDef)) {
      return t();
    }

    t();
  }
}
