import { createBaseError } from './create-error';
import { ErrorOptions } from './error-host';

export interface UnauthorizedErrorOptions extends ErrorOptions {}

export const UNAUTHORIZED_ERROR = (options: UnauthorizedErrorOptions) => {
  const title = "Unauthorized exception";
  const description = `You are not authorized to use the command \`${options.route.prefix}${options.route.name}\``;
  const message = createBaseError(options, title, description);

  return message;
};
