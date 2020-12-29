import { MessageEmbed } from 'discord.js';

import { IErrorOptions } from './error-host';

export const createBaseError = (
  options: IErrorOptions,
  title: string,
  description: string
) => {
  return new MessageEmbed()
    .setColor(options.color)
    .setTitle(title)
    .setAuthor(options.clientUser.username, options.clientUser.avatarURL())
    .setDescription(description)
    .setTimestamp();
};
