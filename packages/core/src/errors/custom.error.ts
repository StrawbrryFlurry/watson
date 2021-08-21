import { createBaseError } from './create-error';
import { ErrorOptions } from './error-host';

export interface CustomErrorOptions extends ErrorOptions {
  message: string;
}

export const CUSTOM_ERROR = (options: CustomErrorOptions) => {
  const title = "An error occured while executing the command";
  const description = options.message;
  const message = createBaseError(options, title, description);

  return message;
};
