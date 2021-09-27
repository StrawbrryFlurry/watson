/**
 *  TODO: If we're going to use the closure compiler,
 * we need to make sure that these property names
 * can still be resolved even if closure is going
 * to rename them to a more compact / efficient
 * one.
 */
import { InjectorLifetime, ProvidedInScope } from '@decorators';
import { Type } from '@interfaces';

/**
 * The element ID is used by the DI
 * framework to determine wether a
 * injector has a specific provider.
 *
 * There are three different types
 * of Element IDs:
 *
 * - [1 .. n] User defined providers and or
 *            elements created by watson for
 *            receivers / guards / pipes etc.
 *            other internal types.
 * - [0] Internal elements from the root
 *     injector
 * - [-1] Context Providers which can
 *   only be resolved by a context
 *   injector
 * - [-2] The current injector
 */
export const WATSON_ELEMENT_ID = "ɵeid";

export enum InjectorElementId {
  Root = 0,
  Context = -1,
  Injector = -2,
}

/**
 * Any type (`Object`) that is resolved by
 * an injector will have this filed, referencing
 * the injector that has created it.
 */
export const WATSON_INJ_IMPL = "ɵinj";

/**
 * Any type (`Object`) that is resolved by
 * an injector will have this field, referencing
 * the {@link Binding } type from which it was
 * created.
 */
export const WATSON_BINDING_DEF = "ɵbind";

/**
 * Property on a {@link Type} that
 * defines what lifetime a given provider
 * has.
 *
 * {@link InjectorLifetime}
 */
export const WATSON_PROV_LIFETIME = "ɵlifetime";

/**
 * Property on a {@link Type} that
 * defines what injector scope the type
 * is restricted to.
 *
 * {@link ProvidedInScope}
 */
export const WATSON_PROV_SCOPE = "ɵscope";

export function getOwnDefinition<T>(
  type: Type | Object,
  field: string
): T | null {
  return (type as Object).hasOwnProperty(field) ? type[field] : null;
}

/** Jsdoc reference */
const _: InjectorLifetime = InjectorLifetime.Singleton;
const __: ProvidedInScope = "root";
