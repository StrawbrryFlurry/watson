import { DEFAULT_LIFETIME, DEFAULT_SCOPE, InjectableOptions } from '@decorators';
import { mergeDefaults } from '@utils';

import { W_PROV_LIFETIME, W_PROV_SCOPE } from '../..';

export function DIProvided<T extends new (...args: any[]) => any>(
  options: InjectableOptions = {},
  xtends: T = class {} as T
) {
  const { lifetime, providedIn } = mergeDefaults(options, {
    lifetime: DEFAULT_LIFETIME,
    providedIn: DEFAULT_SCOPE,
  });

  return class extends xtends {
    constructor(...args: any) {
      super(...args);
    }

    public static [W_PROV_LIFETIME] = lifetime;
    public static [W_PROV_SCOPE] = providedIn;
  };
}
