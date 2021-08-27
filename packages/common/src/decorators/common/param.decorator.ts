import { Type } from '@interfaces/type.interface';

import { PARAM_METADATA } from '../../constants';
import { mergeDefaults } from '../../utils';

export interface CommandParameterOptions<T = any> {
  /**
   * Internal name the parameter should be referred as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name?: string;
  /**
   * Label that describes the parameter
   */
  label?: string;
  /** The type this parameter will be parsed as */
  type?: Type;
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
export function Param(options?: CommandParameterOptions): ParameterDecorator;
export function Param(
  options: CommandParameterOptions = {}
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
