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
export const W_PROV = "ɵiprov";

export interface ɵHasProv {
  [W_PROV]: {
    providedIn: any;
    lifetime: any;
    multi: boolean;
  };
}

export const W_MODULE_PROV = "ɵmprov";

export const W_INJECT_FLAG = "ɵiflag";

/**
 * Property on an injector that contains
 * a map of all bindings that are registered
 * on the injector.
 */
export const W_INJ_REC = "ɵijrec";

export interface ɵHasInjectorRecords {
  [W_INJ_REC]: Map<any, any>;
}
