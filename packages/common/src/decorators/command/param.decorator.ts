import { Type } from 'interfaces';

import { RouteParamType } from '../../enums';
import { isFunction } from '../../utils';
import { createParamDecorator } from '../create-param-decorator';

/**
 * Injects the parameters of a command to the argument in the command handler method.
 * @param param The name of the parameter to inject.
 *
 * If no parameter is specified all parameters will be injected as an object.
 * @example
 * ```{
 *  [name]: value
 * }```
 */
export function InjectParam(): ParameterDecorator;
export function InjectParam(param: string): ParameterDecorator;
export function InjectParam(options?: string): ParameterDecorator {
  return createParamDecorator(RouteParamType.PARAM, options);
}

export function InjectEvent(): ParameterDecorator;
export function InjectEvent(property: string | Type): ParameterDecorator;
export function InjectEvent(options?: string | Type): ParameterDecorator {
  if (isFunction(options)) {
    options = (options as Function).name;
  }

  return createParamDecorator(RouteParamType.EVENT, options);
}

/**
 * Injects the channel the command was used in to the argument in the command handler method.
 */
export function InjectChannel(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CHANNEL);
}

/**
 * Injects the original message object to the argument in the command handler method.
 */
export function InjectMessage(): ParameterDecorator {
  return createParamDecorator(RouteParamType.MESSAGE);
}

/**
 * Injects the DiscordJS client instance to the argument in the command handler method.
 */
export function InjectClient(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CLIENT);
}

/**
 * Injects the guild the command was used in to the argument in the command handler method.
 *
 * If the command was used in a direct message the value will be `undefined`.
 */
export function InjectGuild(): ParameterDecorator {
  return createParamDecorator(RouteParamType.GUILD);
}

/**
 * Injects the user Inject whom the message was sent Inject to the argument in the command handler method.
 */
export function InjectUser(): ParameterDecorator {
  return createParamDecorator(RouteParamType.USER);
}

/**
 * Injects the full command context to the argument in the command handler method.
 */
export function InjectContext(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CONTEXT);
}
