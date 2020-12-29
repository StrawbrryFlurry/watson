import { ICommandParam } from '@watson/common';
import { EmbedFieldData } from 'discord.js';

import { ReadableArgumentTypeHelper } from '../helpers';
import { createBaseError } from './create-error';
import { IErrorOptions } from './error-host';

export interface IBadArgumentErrorOptions extends IErrorOptions {
  param: ICommandParam;
}

export const BAD_ARGUMENT_ERROR = (options: IBadArgumentErrorOptions) => {
  const title = "Bad argument exception";
  const description = `The argument ${
    options.param.name
  } of type ${ReadableArgumentTypeHelper(
    options.param.type
  )} was not provided or is of the wrong type.`;

  const message = createBaseError(options, title, description);
  const fields: EmbedFieldData[] = [];
  const exampleParams: string[] = [];

  fields.push(
    {
      name: "Command:",
      value: options.route.name,
    },
    {
      name: "Parameters",
      value: "See all the parameters below:",
    }
  );

  options.route.params.forEach((parm) => {
    fields.push({
      name: parm.name,
      value: `Type: ${ReadableArgumentTypeHelper(parm.type)} Optional?: ${
        parm.optional
      }`,
    });

    exampleParams.push(parm.name);
  });

  fields.push({
    name: "Example",
    value: `${options.route.prefix}${options.route.name} ${exampleParams.join(
      " "
    )}`,
  });

  message.addFields(...fields);
  return message;
};
