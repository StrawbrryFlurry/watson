import { CommandArgument } from '@watsonjs/common';

import { commandExampleUtil, ReadableArgumentTypeHelper } from '../util';
import { createBaseError } from './create-error';
import { ErrorOptions as ErrorOptions } from './error-host';

export interface BadArgumentErrorOptions extends ErrorOptions {
  argument: CommandArgument;
}

export const BAD_ARGUMENT_ERROR = (options: BadArgumentErrorOptions) => {
  const title = "Bad argument exception";
  const { argument, route } = options as any;
  const description = `The argument ${
    argument.name
  } of type ${ReadableArgumentTypeHelper(
    argument.type
  )} was not provided or is of the wrong type.`;

  const message = createBaseError(options, title, description);
  const fields = commandExampleUtil(route);

  message.addFields(...fields);
  return message;
};
