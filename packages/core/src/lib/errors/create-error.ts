import { MessageEmbed } from 'discord.js';

import { ErrorOptions } from './error-host';

export const createBaseError = (
  options: ErrorOptions,
  title: string,
  description: string
) => {
  return new MessageEmbed()
    .setColor(options.color as any)
    .setTitle(title)
    .setAuthor(
      options.clientUser.username,
      options.clientUser.avatarURL() as any
    )
    .setDescription(description)
    .setTimestamp();
};
