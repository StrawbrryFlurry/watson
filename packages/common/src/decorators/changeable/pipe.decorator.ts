import { PIPE_METADATA } from "../../constants";
import { PipeTransform } from "../../interfaces";
import { applyStackableMetadata } from "../apply-stackable-metadata";

/**
 * Use pipes to parse command arguments without relying on Watsons command parser.
 * When you apply multiple parsers they are getting called in the same order as they are in the array.
 * If you return object keys with the same name from multiple parsers the last one returned will be used.
 * @example
 * Pipe1 => { name: 'foo', cat: 'meow' }
 * Pipe2 => { baz: 42 }
 * Pipe3 => { name: 'bar', dog: 'woof' }
 *
 * Result => { name: 'bar', baz: 42, cat: 'meow , dog: 'woof' }
 *
 * @param pipesFn Functions that return objects that are set as the command arguments
 * @param pipes Pipe calsses that implement the PipeTransform interface
 *
 * @note
 * You can access the resulting params by using the `@Param` parameter decorator.
 * ```
 * `@Command()`
 * handleStuff(`@Param('name')` name: string) {  }
 * ```
 * @note
 * If you were to use Watsons parser in combination with pipes keep in
 * mind that the original parse result will be overwritten. You will however have access
 * to all parsed data while pipes are being processed.
 * ```
 * transform(ctx: ExecutionContext) {
 *  const parsed = ctx.getContextData();
 * }
 * ```
 */
export function UsePipes(
  ...pipes: (PipeTransform | Function)[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertykey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(PIPE_METADATA, pipes, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(PIPE_METADATA, pipes, target);
  };
}
