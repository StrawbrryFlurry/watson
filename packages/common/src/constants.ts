/** @Metadata */

export const MODULE_METADATA = {
  PROVIDERS: "module-providers:meta",
  IMPORTS: "module-imports:meta",
  ROUTER: "module-routers:meta",
  EXPORTS: "module-exports:meta",
};

export const MODULE_GLOBAL_METADATA = "module-global:meta";

export const INJECTABLE_METADATA = "injectable:meta";

export const ROUTER_METADATA = "router:meta";

export const EVENT_METADATA = "event:meta";
export const SLASH_COMMAND_METADATA = "slash-command:meta";
export const SLASH_COMMAND_GROUP_METADATA = "slash-command-group:meta";
export const APPLICATION_COMMAND_METADATA = "application-command:meta";
export const COMMAND_METADATA = "command:meta";
export const SUB_COMMAND_METADATA = "sub-command:meta";
export const PARAM_METADATA = "param:meta";

export const COOLDOWN_METADATA = "cooldown:meta";
export const PREFIX_METADATA = "prefix:meta";

export const PIPE_METADATA = "pipe:meta";
export const GUARD_METADATA = "guard:meta";
export const FILTER_METADATA = "filter:meta";
export const INTERCEPTOR_METADATA = "interceptor:meta";
export const EXCEPTION_HANDLER_METADATA = "exception-handler:meta";

export const INJECT_DEPENDENCY_METADATA = "inject:dependency";
export const OPTIONAL_DEPENDENCY_METADATA = "inject:optional";

export const UNICODE_EMOJI_REGEX =
  /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/;
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

export const USER_MENTION_REGEXP = /^<@\d+>$/;
export const CHANNEL_MENTION_REGEXP = /^<#\d+>$/;
export const ROLE_MENTION_REGEXP = /^<@&\d+>$/;
