import { Message } from 'discord.js';
import { Observable } from 'rxjs';

/**
 * Implement this interface when creating your own
 * prefix class. This can for example be used if
 * your command is dynamic among different
 * guilds.
 */
export interface CommandPrefix {
  /**
   * The prefix string
   */
  prefix?: string;
  /**
   * If the prefix is named.
   * @example
   * `pls ban @username`
   * where pls is the named prefix
   */
  isNamedPrefix?: boolean;
  /**
   * This method returns the prefix that should
   * be applied when matching incomming messages.
   */
  getPrefix(message: Message): string | Promise<string> | Observable<string>;
}
