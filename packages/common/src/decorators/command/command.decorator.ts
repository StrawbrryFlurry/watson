import { isUndefined } from "../../utils";
import {
  COMMAND_DESCRIPTOR_METADATA,
  COMMAND_OPTIONS_METADATA,
  COMMAND_PROPERTY_KEY_METADATA,
} from "../../constants";
export interface ICommandOptions {}

export function Command(commandOptions?: ICommandOptions): MethodDecorator {
  const options = isUndefined(commandOptions) ? undefined : commandOptions;

  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(COMMAND_OPTIONS_METADATA, options, target);
    Reflect.defineMetadata(COMMAND_DESCRIPTOR_METADATA, descriptor, target);
    Reflect.defineMetadata(COMMAND_PROPERTY_KEY_METADATA, propertyKey, target);
  };
}
