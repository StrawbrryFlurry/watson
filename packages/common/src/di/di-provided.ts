import { HasProv, W_PROV } from '@common/fields';
import { mergeDefaults } from '@common/utils';

import { DEFAULT_LIFETIME, DEFAULT_SCOPE, InjectableOptions, ɵdefineInjectable } from './injection-token';

/**
 * Same as `@Injectable` but allows us to
 * reference the static DI properties on
 * the type without having to cast it first.
 */
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
      ɵdefineInjectable(this.prototype, providedIn, lifetime);
    }

    public static [W_PROV]: HasProv["ɵprov"] = ɵdefineInjectable(
      {},
      providedIn,
      lifetime
    );
  };
}
