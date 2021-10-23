import { SUB_COMMAND_METADATA } from '@common/constants';
import { CommandOptions } from '@common/decorators';
import { FunctionPropertiesOfType, isNil } from '@common/utils';
import { isString } from 'class-validator';

export interface SubCommandOptions extends CommandOptions {
  parent?: string | number | symbol;
}

/**
 * Marks a command in a receiver as a sub command.
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
  K extends keyof T = FunctionPropertiesOfType<T>
>(parent: K, name: string, options: SubCommandOptions): MethodDecorator;
export function SubCommand<
  T extends Object,
  K extends keyof T = FunctionPropertiesOfType<T>
>(parent: K, options: SubCommandOptions): MethodDecorator;
export function SubCommand<
  T extends Object,
  K extends keyof T = FunctionPropertiesOfType<T>
>(
  parentNameOrOptions: string | SubCommandOptions | K,
  nameOrOptions?: string | SubCommandOptions,
  commandOptions?: SubCommandOptions
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    const apply = (metadata: SubCommandOptions) =>
      Reflect.defineMetadata(SUB_COMMAND_METADATA, metadata, descriptor.value);

    if (!isNil(commandOptions)) {
      const options: SubCommandOptions = {
        ...commandOptions,
        parent: parentNameOrOptions as K,
        name: (nameOrOptions as string) ?? commandOptions.name ?? null,
      };

      return apply(options);
    }

    if (isString(nameOrOptions)) {
      return apply({
        parent: parentNameOrOptions as string,
        name: nameOrOptions,
      });
    }

    if (isString(parentNameOrOptions)) {
      apply({ parent: parentNameOrOptions as string, ...nameOrOptions }!);
    }

    apply({ ...(parentNameOrOptions as SubCommandOptions) });
  };
}
