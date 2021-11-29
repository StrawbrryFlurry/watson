import { SUB_COMMAND_METADATA } from '@common/constants';
import { And, FunctionPropertiesOfType, IsLowerCase, isNil, isString, StringHasLength, ValueOrNever } from '@common/utils';

import { CommandOptions } from '.';
import { SlashCommandOptions } from '../application';

export type SubCommandOptions<
  N extends string = any,
  D extends string = any
> = (CommandOptions | SlashCommandOptions<N, D>) & {
  parent: Function;
};

/**
 * Marks a command in a router as a sub command.
 *
 * A sub command works exactly the same as a regular
 * command but is only run if both the command name
 * and sub command name are matched with the message
 * content:
 *
 * !help      -> Will run the help command
 * !help user -> Will run the user help sub command
 *
 *
 * ```
 * ```
 */

export function SubCommand<
  T extends Object,
  K extends keyof T = FunctionPropertiesOfType<T>
>(parent: K): MethodDecorator;
export function SubCommand<
  T extends Object,
  N extends string,
  D extends string,
  R extends ValueOrNever<
    And<[IsLowerCase<N>, StringHasLength<N, 32>]>,
    MethodDecorator
  >,
  K extends keyof T = FunctionPropertiesOfType<T>
>(parent: K, name: string, options: SubCommandOptions<N, D>): R;
export function SubCommand<
  T extends Object,
  N extends string,
  D extends string,
  R extends ValueOrNever<
    And<[IsLowerCase<N>, StringHasLength<N, 32>]>,
    MethodDecorator
  >,
  K extends keyof T = FunctionPropertiesOfType<T>
>(parent: K, options: SubCommandOptions<N, D>): R;
export function SubCommand<
  T extends Object,
  N extends string,
  D extends string,
  R extends ValueOrNever<
    And<[IsLowerCase<N>, StringHasLength<N, 32>]>,
    MethodDecorator
  >,
  K extends Extract<keyof T, string> = Extract<
    FunctionPropertiesOfType<T>,
    string
  >
>(
  parent: K,
  nameOrOptions?: string | SubCommandOptions<N, D>,
  commandOptions?: SubCommandOptions<N, D>
): R {
  return ((
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    const apply = (metadata: SubCommandOptions<N, D>) =>
      Reflect.defineMetadata(SUB_COMMAND_METADATA, metadata, descriptor.value);

    const getParent = (name: string) => Object.getPrototypeOf(target)[name];

    if (!isNil(commandOptions)) {
      const options: SubCommandOptions<N, D> = {
        ...commandOptions,
        parent: getParent(parent),
        name: (nameOrOptions as string) ?? commandOptions.name ?? null,
      };

      return apply(options);
    }

    if (isString(nameOrOptions)) {
      return apply({
        parent: getParent(parent),
        name: nameOrOptions,
      });
    }

    apply({ parent: getParent(parent), ...nameOrOptions }!);
  }) as R;
}
