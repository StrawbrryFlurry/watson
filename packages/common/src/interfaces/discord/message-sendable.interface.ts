import { MessageAttachment, MessageEmbed } from 'discord.js';

/**
 * Represents a type that is sendable to a text channel
 * via the discordjs api
 */
export type MessageSendable =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | MessageEmbed
  | MessageAttachment
  | (string | MessageEmbed | MessageAttachment)[];
