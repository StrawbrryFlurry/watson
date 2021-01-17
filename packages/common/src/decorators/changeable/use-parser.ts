import { ExecutionContext } from 'interfaces';
import { Observable } from 'rxjs';

import { PARSER_METADATA } from '../../constants';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export type ICustomParser<T extends {} = any> = (
  ctx: ExecutionContext
) => T | Promise<T> | Observable<T>;

/**
 * Use parsers to parse command arguments without relying on Watsons command parser.
 * When you apply multiple parsers they are getting called in the same order as they are in the array.
 * If you return object keys with the same name from multiple parsers the last one returned will be used.
 * @example
 * Parser1 => { name: 'foo', cat: 'meow' }
 * Parser2 => { baz: 42 }
 * Parser3 => { name: 'bar', dog: 'woof' }
 *
 * Result => { name: 'bar', baz: 42, cat: 'meow , dog: 'woof' }
 *
 * @param parsers Functions that return objects that are set as the command arguments
 *
 * @note
 * You can access the resulting params by using the `@Param` parameter decorator.
 * ```
 * `@Command()`
 * handleStuff(`@Param('name')` name: string) {  }
 * ```
 */
export function UseParser(
  parsers: ICustomParser[]
): MethodDecorator | ClassDecorator {
  return (
    target: any,
    propertykey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(PARSER_METADATA, parsers, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(PARSER_METADATA, parsers, target);
  };
}
