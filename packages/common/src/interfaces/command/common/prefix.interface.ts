import { Message } from 'discord.js';
import { Observable } from 'rxjs';

export type PrefixResolutionFn = (
  message: Message
) => string | Promise<string> | Observable<string>;

export type Prefix = PrefixResolvable | string;

/**
 * Implement this interface when creating your own
 * prefix class. This can for example be used if
 * your command is dynamic among different
 * guilds.
 *
 * ```ts
 * \@Injectable()
 * export class GuildPrefix implement PrefixResolvable {
 *  constructor(private readonly guildService: GuildService) {  }
 *
 *  public async resolve(message: Message) {
 *    const { guild: { id: guildId } } = message;
 *    const { prefix } = await this.guildService.findById(guildId);
 *    return prefix;
 *  }
 * }
 * ```
 */
export interface PrefixResolvable {
  /**
   * This method returns the prefix that should
   * be applied when matching incoming messages.
   */
  resolve: PrefixResolutionFn;
}
