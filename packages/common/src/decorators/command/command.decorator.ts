import { COMMAND_OPTIONS_METADATA } from '../../constants';
import { CommandArgumentTypes } from '../../interfaces';
import { isUndefined } from '../../utils';

export interface ICommandParams {
  [index: number]: {
    optional?: boolean;
    type: CommandArgumentTypes;
    encapsulator?: string;
    defautl: any;
  };
}

export interface ICommandOptions {
  command?: string;
  alias?: string[];
  params?: ICommandParams;
}

export function Command(): MethodDecorator;
export function Command(command: string): MethodDecorator;
export function Command(
  command?: string,
  commandOptions?: ICommandOptions
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    const options = isUndefined(commandOptions) ? {} : commandOptions;
    options["command"] = isUndefined(command)
      ? commandOptions?.command
      : command;

    Reflect.defineMetadata(COMMAND_OPTIONS_METADATA, options, descriptor.value);
  };
}
