import { MessageAttachment, MessageEmbed } from 'discord.js';

/**
 * Represents a type that is sendable to a text channel
 * via the discordjs api
 */
export type APISendable =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | MessageEmbed
  | MessageAttachment
  | (string | MessageEmbed | MessageAttachment)[];

/**
 * Anything that Watson will accept as a
 * message to be sent to a text channel
 */
export type MessageSendable = APISendable & Object;
