import { PARAM_METADATA } from "../../constants";
import { mergeDefaults } from "../../utils";

export interface ICommandParameterMetadata<T = any> {
  /**
   * Internal name the parameter should be reffered as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name?: string;
  /**
   * Label that describes the parameter
   */
  label?: string;
  /**
   * Makes the parameter optional.
   * Optional parameters cannot be followed by mandatory ones.
   * If default is set this option will automatically be set
   * @default false
   */
  optional?: boolean;
  /**
   * Uses the rest of the message content
   * This option can only be used for the last parameter
   * @default false
   */
  hungry?: boolean;
  /**
   * The default value if none was provided
   */
  default?: T;
  /**
   * An array of options the user can choose from
   * for this argument.
   */
  choices?: T[];
}

/**
 * Injects the parameters of a command to the argument in the command handler method.
 * @param options Options to configure the parameter.
 *
 * Valid Parameter types include:
 *
 * Primitives:
 * `String`,
 * `TextArgument`,
 * `Boolean`,
 * `Number`
 *
 * Data structures:
 * `Date`,
 * `UserArgument`,
 * `ChannelArgument`,
 * `VoiceChannelArgument`,
 * `RoleArgument`
 */
export function Param(): ParameterDecorator;
export function Param(options?: ICommandParameterMetadata): ParameterDecorator;
export function Param(
  options: ICommandParameterMetadata = {}
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const metadata = mergeDefaults(options, {
      name: propertyKey,
      hungry: false,
      optional: false,
    });

    const existingMetadata =
      Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];

    const mergedMetadata = [...existingMetadata, metadata];

    Reflect.defineMetadata(PARAM_METADATA, mergedMetadata, target, propertyKey);
  };
}
