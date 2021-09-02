import { SUB_COMMAND_METADATA } from '@constants';
import { CommandOptions } from '@decorators';
import { isNil } from '@utils';
import { isString } from 'class-validator';

export interface SubCommandOptions extends CommandOptions {}

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
 * A sub command will require ONE and only one
 * command to be registered in the same receiver.
 */
export function SubCommand(): MethodDecorator;
export function SubCommand(name: string): MethodDecorator;
export function SubCommand(
  name: string,
  options: SubCommandOptions
): MethodDecorator;
export function SubCommand(options: SubCommandOptions): MethodDecorator;
export function SubCommand(
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
        name: nameOrOptions as string,
      };

      return apply(options);
    }

    if (isString(nameOrOptions)) {
      return apply({ name: nameOrOptions });
    }

    apply(nameOrOptions);
  };
}
