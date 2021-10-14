import { InjectorLifetime, ProvidedInScope } from '@decorators';
import { CustomProvider, Type } from '@interfaces';

/**
 *  TODO: If we're going to use the closure compiler,
 * we need to make sure that these property names
 * can still be resolved even if closure is going
 * to rename them to a more compact / efficient
 * one.
 */

/**
 * Injectables, which are types in the framework, that
 * are used once a method in a component is called.
 *
 * Unlike providers, injectables can also be regular
 * functions which have no way of identifying what
 * injectable type they belong to. Through this property
 * we have a reference point to what method a specific
 * injectable needs to be provided.
 */
export const W_INJ_TYPE = "ɵinjt";

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
export const W_ELEMENT_ID = "ɵeid";

export enum InjectorElementId {
  Root = 0,
  Context = -1,
  Injector = -2,
}

/**
 * Any type (`Object`) that is resolved by
 * an injector will have this field, referencing
 * the {@link Binding } type from which it was
 * created.
 */
export const W_BINDING_DEF = "ɵbidef";

export interface HasBindingDef<T = any> {
  [W_BINDING_DEF]: T;
}

/**
 * Property on a {@link Type} that
 * defines what lifetime a given provider
 * has.
 *
 * {@link InjectorLifetime}
 */
export const W_PROV_LIFETIME = "ɵprovlife";

export interface HasProvLifetime {
  [W_PROV_LIFETIME]: InjectorLifetime;
}

/**
 * Property on a {@link Type} that
 * defines what injector scope the type
 * is restricted to.
 *
 * {@link ProvidedInScope}
 */
export const W_PROV_SCOPE = "ɵprovsc";

export interface HasProvScope {
  [W_PROV_SCOPE]: ProvidedInScope;
}

export const W_MODULE_PROV = "ɵmoprov";

export interface HasModuleProv {
  [W_MODULE_PROV]: CustomProvider | Type;
}

export function getOwnDefinition<T>(
  type: Type | Object,
  field: string
): T | null {
  return (type as Object).hasOwnProperty(field) ? type[field] : null;
}

/** Jsdoc reference */
const _: InjectorLifetime = InjectorLifetime.Singleton;
const __: ProvidedInScope = "root";
