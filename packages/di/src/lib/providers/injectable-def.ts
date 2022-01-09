import { ProviderResolvable } from '@di/core/injector';
import { W_PROV, ɵHasProv } from '@di/fields';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

import { isCustomProvider } from './custom-provider';
import { resolveForwardRef } from './forward-ref';
import { InjectableDef, InjectionToken, Providable, ɵdefineInjectable } from './injection-token';

export function getProviderToken(
  provider: ProviderResolvable
): Type | InjectionToken {
  if (isCustomProvider(provider)) {
    return resolveForwardRef(provider.provide);
  }

  return resolveForwardRef(provider);
}

/**
 * Same as `getInjectableDef` but can return
 * `null` if there is no injectable definition
 * set.
 */
export function getUnsafeInjectableDef(
  typeOrProvider: ProviderResolvable | Providable
): InjectableDef | null {
  if (isNil(typeOrProvider)) {
    throw "Can't get injectable definition of null or undefined";
  }

  const token = getProviderToken(<ProviderResolvable>typeOrProvider);
  return (<ɵHasProv>(<any>token))[W_PROV] ?? null;
}

/**
 * Returns the injectable definition of
 * a type defined in `W_PROV`. If no
 * definition can be found, the default
 * configuration will be set and returned.
 */
export function getInjectableDef(
  typeOrProvider: ProviderResolvable | Providable
): InjectableDef {
  let injectableDef = getUnsafeInjectableDef(typeOrProvider);
  let typeOrToken = typeOrProvider;

  if (!isNil(injectableDef)) {
    return injectableDef;
  }

  if (isCustomProvider(typeOrProvider)) {
    const { provide } = typeOrProvider;
    typeOrToken = resolveForwardRef(provide);
  }

  return ɵdefineInjectable(typeOrToken);
}
