import { createBaseError } from './create-error';
import { IErrorOptions } from './error-host';

export interface IUnauthorizedErrorOptions extends IErrorOptions {}

export const UNAUTHORIZED_ERROR = (options: IUnauthorizedErrorOptions) => {
  const title = "Unauthorized exception";
  const description = `You are not authorized to use the command \`${options.route.prefix}${options.route.name}\``;
  const message = createBaseError(options, title, description);

  return message;
};
