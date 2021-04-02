import { ICommandParam } from "@watsonjs/common";

import { commandExampleUtil, ReadableArgumentTypeHelper } from "../helpers";
import { createBaseError } from "./create-error";
import { IErrorOptions } from "./error-host";

export interface IMissingArgumentErrorOptions extends IErrorOptions {
  parameters: ICommandParam | ICommandParam[];
}

export const MISSING_ARGUMENT_ERROR = (
  options: IMissingArgumentErrorOptions
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
