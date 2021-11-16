import { PARAM_METADATA } from '@common/constants';
import { applyStackableMetadata, ParameterMetadata } from '@common/decorators';
import { W_PARAM_TYPE } from '@common/fields';
import { ADate, CommandParameterType, DateParameterOptions, Type } from '@common/interfaces';
import { getFunctionParameters, mergeDefaults } from '@common/utils';

type GetConfigurationsFromParameterType<T> = T extends ADate
  ? DateParameterOptions
  : never;

export interface CommandParameterOptions<T = any> {
  /**
   * Internal name the parameter should be referred as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name?: string;
  /**
   * Description that describes the parameter
   */
  description?: string;
  /** The type this parameter will be parsed as */
  type?: Type | null;
  /**
   * Makes the parameter optional.
   * Optional parameters cannot be followed by mandatory ones.
   * If default is set this option will automatically be set
   * @default false
   */
  optional?: boolean;
  /**
   * Uses the rest of the message content **nom**
   *
   * This option can only be used for the last parameter
   *
   * If you want to specify this option, you'll
   * have to use the `type` parameter option
   * to specify the actual type you want this
   * argument to be. Tsc will emit this type
   * as `[Array]` which we can't infer the desired
   * type from. - The output will always be an array
   * of that type.
   * @default false
   */
  hungry?: boolean;
  /**
   * The parameter group the parameter will be added
   * to. Using parameter groups you can give users
   * the option to use a given command with a set of
   * pre-defined overloads whose arguments will be
   * checked. You can inject the group name via
   * the token `ParameterGroup`
   */
  group?: string;
  /**
   * The default value if none was provided
   */
  default?: T;
  /**
   * Supply some additional configuration
   * for the parameter. You can get suggestions
   * about what configurations can be applied
   * by specifying the parameter type as a generic
   * to this decorator.
   */
  configuration?: GetConfigurationsFromParameterType<T>;
}

export interface ApplicationCommandParameterOptions<T = any> {
  /**
   * Internal name the parameter should be referred as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name?: string;
  /**
   * Description that describes the parameter
   */
  description?: string;
  /** The type this parameter will be parsed as */
  type?: Type | null;
  /**
   * Makes the parameter optional.
   * If default is set this option will automatically be set
   * @default false
   */
  optional?: boolean;
  /**
   * The default value if none was provided
   */
  default?: T;
  /**
   * Supply some additional configuration
   * for the parameter. You can get suggestions
   * about what configurations can be applied
   * by specifying the parameter type as a generic
   * to this decorator.
   */
  configuration?: GetConfigurationsFromParameterType<T>;
}

export interface ApplicationCommandParameterMetadata<T = any>
  extends ApplicationCommandParameterOptions,
    ParameterMetadata {}

export interface CommandParameterMetadata<T = any>
  extends CommandParameterOptions<T>,
    ParameterMetadata {}

/**
 * Injects the parameters of a command or interaction to the argument in
 * the command handler method.
 *
 * @param options Options to configure the parameter.
 *
 * Valid Parameter types include:
 *
 * Primitives:
 * ---
 * - `String`
 * - `Boolean`
 * - `Number`
 *
 * Data structures:
 * ---
 * - `AStringExpandable`
 * - `AStringLiteral`
 * - `AStringTemplate`
 * - `AURL`
 * - `ADate`
 *
 * Discord Types:
 * ---
 * - `AChannel`
 * - `ARole`
 * - `AUser`
 * - `AEmote`
 * - `ACodeBlock`
 */
export function Param(): ParameterDecorator;
export function Param(options?: CommandParameterOptions): ParameterDecorator;
export function Param(
  options?: ApplicationCommandParameterOptions
): ParameterDecorator;
export function Param(
  options: CommandParameterOptions | ApplicationCommandParameterOptions = {}
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const params = getFunctionParameters(
      Object.getPrototypeOf(target)[propertyKey]
    );

    const metadata = mergeDefaults<CommandParameterMetadata>(options, {
      name: params[parameterIndex],
      parameterIndex: parameterIndex,
      hungry: false,
      optional: false,
      description: params[parameterIndex],
    });

    applyStackableMetadata(
      PARAM_METADATA,
      target.constructor,
      [metadata],
      propertyKey
    );
  };
}

/**
 * Watson uses the `W_PARAM_TYPE` property
 * on an object to check whether it should
 * be used as a parameter that is added
 * to the command | interaction route.
 *
 * This method adds that property to
 * the builtin JavaScript types
 * that are also supported as valid
 * parameter types.
 */
const PATCH_VANILLA_JS_TYPES = () => {
  if (PATCH_VANILLA_JS_TYPES["ɵdidrun"]) {
    return;
  }

  PATCH_VANILLA_JS_TYPES["ɵdidrun"] = true;
  String[W_PARAM_TYPE] = CommandParameterType.String;
  Date[W_PARAM_TYPE] = CommandParameterType.Date;
  Number[W_PARAM_TYPE] = CommandParameterType.Number;
};
PATCH_VANILLA_JS_TYPES();
