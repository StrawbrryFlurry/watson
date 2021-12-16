import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { W_PARAM_TYPE } from '@common/fields';

/**
 * Marks the decorated class as a usable parameter type.
 *
 * General usage:
 * ```js
 * @\ParameterType(CommandParameterType.String)
 * export abstract class CustomStringParameterType extends String  {  }
 * ```
 *
 * Creating custom parameter types
 * ```js
 * @\ParameterType(CommandParameterType.String)
 * export abstract class CustomStringParameterType extends String  {  }
 * ```
 *
 *
 */
export function ParameterType(type: CommandParameterType): ClassDecorator {
  return (target: Object) => {
    target[W_PARAM_TYPE] = type;
  };
}
