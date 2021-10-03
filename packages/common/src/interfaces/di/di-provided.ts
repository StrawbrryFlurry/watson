import { DEFAULT_LIFETIME, DEFAULT_SCOPE, InjectableOptions } from '@decorators';
import { mergeDefaults } from '@utils';

import { WATSON_PROV_LIFETIME, WATSON_PROV_SCOPE } from '../..';

export function DIProvided<T extends new (...args: any[]) => any>(
  options: InjectableOptions = {},
  xtends: T = class {} as any
) {
  const { lifetime, providedIn } = mergeDefaults(options, {
    lifetime: DEFAULT_LIFETIME,
    providedIn: DEFAULT_SCOPE,
  });

  return class extends xtends {
    constructor(...args: any) {
      super(...args);
    }

    public static [WATSON_PROV_LIFETIME] = lifetime;
    public static [WATSON_PROV_SCOPE] = providedIn;
  };
}
