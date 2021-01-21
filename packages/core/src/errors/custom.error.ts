import { createBaseError } from './create-error';
import { IErrorOptions } from './error-host';

export interface ICustomErrorOptions extends IErrorOptions {
  message: string;
}

export const CUSTOM_ERROR = (options: ICustomErrorOptions) => {
  const title = "An error occured while executing the command";
  const description = options.message;
  const message = createBaseError(options, title, description);

  return message;
};
