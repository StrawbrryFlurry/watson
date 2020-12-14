import { COMMAND_DESCRIPTOR_METADATA, COMMAND_OPTIONS_METADATA, COMMAND_PROPERTY_KEY_METADATA } from '../../constants';
import { isUndefined } from '../../utils';

export interface ICommandParams {
  [index: number]: {
    optional?: boolean;
    isUser?: boolean;
    isTextChannel?: boolean;
    isVoiceChannel?: boolean;
    isWordString?: {
      encapsulator: string;
    };
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
      ? isUndefined(commandOptions?.command)
        ? (propertyKey as string)
        : commandOptions.command
      : command;

    Reflect.defineMetadata(COMMAND_OPTIONS_METADATA, options, target);
    Reflect.defineMetadata(COMMAND_DESCRIPTOR_METADATA, descriptor, target);
    Reflect.defineMetadata(COMMAND_PROPERTY_KEY_METADATA, propertyKey, target);
  };
}
