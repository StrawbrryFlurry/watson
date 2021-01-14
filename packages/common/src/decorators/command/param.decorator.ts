import { RouteParamType } from 'enums';

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
export function Param(): ParameterDecorator;
export function Param(param: string): ParameterDecorator;
export function Param(options?: string): ParameterDecorator {
  return createParamDecorator(RouteParamType.PARAM, options);
}

/**
 * Injects the channel the command was used in to the argument in the command handler method.
 */
export function Channel(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CHANNEL);
}

/**
 * Injects the original message object to the argument in the command handler method.
 */
export function Message(): ParameterDecorator {
  return createParamDecorator(RouteParamType.MESSAGE);
}

/**
 * Injects the DiscordJS client instance to the argument in the command handler method.
 */
export function Client(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CLIENT);
}

/**
 * Injects the guild the command was used in to the argument in the command handler method.
 *
 * If the command was used in a direct message the value will be `undefined`.
 */
export function Guild(): ParameterDecorator {
  return createParamDecorator(RouteParamType.GUILD);
}

/**
 * Injects the user from whom the message was sent from to the argument in the command handler method.
 */
export function User(): ParameterDecorator {
  return createParamDecorator(RouteParamType.USER);
}

/**
 * Injects the full command context to the argument in the command handler method.
 */
export function Context(): ParameterDecorator {
  return createParamDecorator(RouteParamType.CONTEXT);
}
