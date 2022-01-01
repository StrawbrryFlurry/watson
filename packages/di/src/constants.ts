export const MODULE_DEFINITION_METADATA = "ɵmodule-def:meta";
export const MODULE_REF_IMPL_METADATA = "ɵmodule-ref-impl:meta";
export const INJECTABLE_METADATA = "ɵinjectable:meta";
export const COMPONENT_METADATA = "ɵcomponent:meta";

export const INJECT_DEPENDENCY_METADATA = "ɵinject:dependency";

export const INJECT_FLAG_METADATA = "ɵinject:flag";

export const JS_COMMENT_REGEX =
  /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/gm;

/**
 * The parameter types that the decorated descriptor value
 * takes.
 *
 * Class prototype parameters
 *```ts
 * `@Router()`
 * class Foo {
 *  constructor(private appService: AppService) {  }
 * }
 *
 * // Reflect.getMetadata(DESIGN_PARAMETERS, Foo);
 * // Class prototype parameters
 * // [ AppService ]
 *```
 *
 * Class method parameters
 *```ts
 * `@Router()`
 * class Foo {
 *  public bar(str: string, klass: SomeClass, inter: SomeInterface) {  }
 * }
 * // Reflect.getMetadata(DESIGN_PARAMETERS, Foo, "bar");
 * // [ String, SomeClass, Object ]
 *```
 */
export const DESIGN_PARAMETERS = "design:paramtypes";
/**
 * The return type of the decorated descriptor
 * is `void` e.g `undefined` if not explicitly
 * defined.
 *
 * ```ts
 * @Router()
 * class Foo {
 *  public bar(): string { /*  *\/ }
 * }
 *
 * // Reflect.getMetadata(DESIGN_RETURN_TYPE, Foo, "bar");
 * // String
 * ```
 */
export const DESIGN_RETURN_TYPE = "design:returntype";
/**
 * The type of the decorated
 * ```ts
 * `@Router()`
 * class Foo {}
 *
 * // Reflect.getMetadata(DESIGN_TYPE, Foo);
 * // Reflect.getMetadata(DESIGN_TYPE, Foo, propertyKey);
 * // Function
 * ```
 */
export const DESIGN_TYPE = "design:type";
