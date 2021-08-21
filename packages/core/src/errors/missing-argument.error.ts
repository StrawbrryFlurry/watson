import { ICommandParam } from '@watsonjs/common';

import { commandExampleUtil, ReadableArgumentTypeHelper } from '../util';
import { createBaseError } from './create-error';
import { ErrorOptions } from './error-host';

export interface MissingArgumentErrorOptions extends ErrorOptions {
  parameters: ICommandParam | ICommandParam[];
}

export const MISSING_ARGUMENT_ERROR = (
  options: MissingArgumentErrorOptions
) => {
  const title = "Missing argument exception";
  const { parameters, route } = options;
  const param = Array.isArray(options.parameters) ? parameters[0] : parameters;

  const description = `The parameter ${
    param.name
  } of type ${ReadableArgumentTypeHelper(param.type)} was not provided.`;

  const message = createBaseError(options, title, description);
  const fields = commandExampleUtil(route);

  message.addFields(...fields);
  return message;
};
