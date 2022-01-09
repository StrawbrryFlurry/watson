/**
 *  TODO: If we're going to use the closure compiler,
 * we need to make sure that these property names
 * can still be resolved even if closure is going
 * to rename them to a more compact / efficient
 * one.
 *
 * Symbol() somehow breaks unit tests. Until
 * we figure out why that is, hidden properties
 * will stay as strings.
 */

/**
 * Interceptors, which are types in the framework, that
 * are used once a method in a component is called.
 *
 * Unlike providers, Interceptors can also be regular
 * functions which have no way of identifying what
 * injectable type they belong to. Through this property
 * we have a reference point to what method a specific
 * injectable needs to be provided.
 */
export const W_INT_TYPE = "ɵinttp";

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
 *            routers / guards / pipes etc.
 *            other internal types.
 * - [0] Internal elements from the root
 *     injector
 * - [-1] Context Providers which can
 *   only be resolved by a context
 *   injector
 * - [-2] The current injector
 */
export const W_ELEMENT_ID = "ɵeid";

export const W_PARAM_TYPE = "ɵprmtp";

export interface ɵHasParamType {
  [W_PARAM_TYPE]: any;
}

/**
 * The source handler through which
 * the interceptor was added. Usually,
 * this is the handler method of a router.
 */
export const W_INT_SRC = "ɵintsc";
