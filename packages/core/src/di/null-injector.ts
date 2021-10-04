import { Binding, Injector } from '@di';
import { isNil, Providable, RuntimeException, stringify, WATSON_BINDING_DEF } from '@watsonjs/common';

export class NullInjector implements Injector {
  public parent: null;

  public async get(typeTokenOrProvider: Providable): Promise<any> {
    const bindingDef = typeTokenOrProvider[WATSON_BINDING_DEF] as
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

    if (bindingDef.optional) {
      return null;
    }

    t();
  }
}
