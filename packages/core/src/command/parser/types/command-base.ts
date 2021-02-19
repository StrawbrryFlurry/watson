import { Message } from 'discord.js';

import { CommandRoute } from '../../../routes';

/**
 * The command base represents the first token that is parsed by the tokenizer.
 * It is the command that will be used by watson to determine wether the message is relevant
 * to any existing route and parse other tokens accordingly to the command parameters registered.
 *
 * @example
 * ```
 * !help help
 * ```
 *
 * Where `!help` is the command base
 */
export class CommandBase {
  /**
   * The name registered in the command route;
   */
  public get name() {
    return this.route.name;
  }
  /**
   * The prefix used to execute this command
   */
  public prefix: string;
  /**
   * The alias used to execute this command
   */
  public alias: string;
  /**
   * The tokenized content from the message `!help`
   */
  public content: String;
  /**
   * The DiscordJs message this command originated from
   */
  public message: Message;
  /**
   * The command route that matched this command
   */
  public route: CommandRoute;

  constructor(message: Message, content: string) {
    this.message = message;
    this.content;
  }
}
