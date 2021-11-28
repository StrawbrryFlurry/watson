import { mergeDefaults } from '@common/utils';

import { DEFAULT_LIFETIME, DEFAULT_SCOPE, InjectableOptions } from '.';
import { HasProv, W_PROV } from '..';

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
    }

    public static [W_PROV]: HasProv["ɵprov"] = {
      lifetime: lifetime,
      providedIn: providedIn,
    };
  };
}
