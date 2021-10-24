import { EmbedFieldData } from 'discord.js';
import { CommandRoute } from 'packages/common/src/interfaces';

/**
 * Generates an example of a command by using the
 * data provided by the route definition
 */
export const commandExampleUtil = (
  routeRef: CommandRoute
): EmbedFieldData[] => {
  const { name, configuration } = routeRef;
  const { params } = configuration;
  const paramNames = params.map((param) => param.name);

  const messageEmbedFields: EmbedFieldData[] = [
    {
      name: "Command",
      value: name,
    },
    {
      name: "Parameters",
      value: "See all the parameters below:",
    },
  ];

  for (const param of params) {
    const { name, optional } = param;

    messageEmbedFields.push({
      name: `-${name}`,
      value: `Type: Optional?: ${optional}`,
    });
  }

  messageEmbedFields.push({
    name: "Example",
    value: `<prefix>${name} ${paramNames.join(" ")}`,
  });

  return messageEmbedFields;
};
