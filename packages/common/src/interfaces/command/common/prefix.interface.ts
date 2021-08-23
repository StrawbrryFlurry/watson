import { Message } from 'discord.js';
import { Observable } from 'rxjs';

export type PrefixResolutionFn = (
  message: Message
) => string | Promise<string> | Observable<string>;

/**
 * Implement this interface when creating your own
 * prefix class. This can for example be used if
 * your command is dynamic among different
 * guilds.
 *
 * ```ts
 * \@Injectable()
 * export class GuildPrefix implement IPrefix {
 *  constructor(private readonly guildService) {  }
 *
 *  public async resolve(message: Message) {
 *    const { guild: { id: guildId } } = message;
 *    const { prefix } = await this.guildService.findById(guildId);
 *    return prefix;
 *  }
 * }
 * ```
 */
export interface Prefix {
  /**
   * If the prefix is static this
   * property holds the string value
   * of the prefix.
   *
   * @WARN
   * Don't set this property if you want
   * the prefix to be resolved by the
   * resolution function. If it is set
   * we'll assume that it's save to use.
   */
  prefix?: string;
  /**
   * This method returns the prefix that should
   * be applied when matching incoming messages.
   */
  resolve?: PrefixResolutionFn;
}
