import { DEFAULT_LIFETIME, DEFAULT_SCOPE, InjectableOptions } from '@common/decorators/common/injectable.decorator';
import { W_PROV_LIFETIME, W_PROV_SCOPE } from '@common/fields';
import { mergeDefaults } from '@common/utils';

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
