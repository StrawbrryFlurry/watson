export const MODULE_METADATA = {
  PROVIDERS: "module:providers",
  IMPORTS: "module:imports",
  RECEIVER: "module:receivers",
  EXPORTS: "module:exports",
};

export const MODULE_GLOBAL_METADATA = "module:global";

export const RECEIVER_METADATA = "reciver:meta";
export const EVENT_METADATA = "event:meta";
export const COMMAND_METADATA = "command:meta";
export const SLASH_COMMAND_METADATA = "slashcommands:meta";
export const PARAM_METADATA = "param:meta";

export const INJECTABLE_METADATA = "injectable:meta";

export const PIPE_METADATA = "pipe:meta";
export const GUARD_METADATA = "guard:meta";
export const FILTER_METADATA = "filter:meta";
export const EXCEPTION_HANDLER_METADATA = "exception.handler:meta";
export const PREFIX_METADATA = "prefix:meta";

export const RECEIVER_ERROR_HANDLER_METADATA = "receiver:error:meta";
export const COMMAND_ERROR_HANDLER_METADATA = "command:error:meta";

export const INQUIRABLE_METADATA = "inquirable:meta";

export const INJECT_DEPENDENCY_METADATA = "inject:dependency";

/**
 * The parmeter types that the decoratee descriptor value
 * takes.
 *
 * Class prototype parameters
 *```ts
 * `@Receiver()`
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
 * `@Receiver()`
 * class Foo {
 *  public bar(str: string, klass: SomeClass, inter: SomeInterface) {  }
 * }
 * // Reflect.getMetadata(DESIGN_PARAMETERS, Foo, "bar");
 * // [ String, SomeClass, Object ]
 *```
 */
export const DESIGN_PARAMETERS = "design:paramtypes";
/**
 * The return type of the decoratee descriptor
 * is `void` e.g `undefined` if not explicitly
 * defined.
 *
 * ```ts
 * @Receiver()
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
 * The type of the decoratee
 * ```ts
 * `@Receiver()`
 * class Foo {}
 *
 * // Reflect.getMetadata(DESIGN_TYPE, Foo);
 * // Reflect.getMetadata(DESIGN_TYPE, Foo, propertyKey);
 * // Function
 * ```
 */
export const DESIGN_TYPE = "design:type";

export const USER_MENTION_REGEXP = /^<@.*>$/;
export const CHANNEL_MENTION_REGEXP = /^<#.*>$/;
export const ROLE_MENTION_REGEXP = /^<@&.*>$/;
