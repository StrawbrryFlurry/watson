/**
 * Property on the {@link Injectable} decorator.
 * This property saves a {@link UniqueTypeArray} of all injectables
 * that should be provided in the root injector.
 */
export const W_GLOBAL_PROV = "ɵgprov";

/**
 * Any type (`Object`) that is resolved by
 * an injector will have this field, referencing
 * the {@link Binding } type from which it was
 * created.
 */
export const W_BINDING_DEF = "ɵbidef";

/**
 * Property on a {@link Type} or {@link InjectionToken}
 * that defines what lifetime and provider scope
 * the given provider has.
 *
 * {@link InjectorLifetime}
 * {@link InjectorScope}
 */
export const W_PROV = "ɵprov";

export interface ɵHasProv {
  [W_PROV]: {
    providedIn: any;
    lifetime: any;
  };
}

export const W_MODULE_PROV = "ɵmoprov";
