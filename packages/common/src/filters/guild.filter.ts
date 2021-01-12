import { Injectable } from 'decorators';
import { ExecutionContext, Filter } from 'interfaces';

/**
 * Default filter for specifing guilds whose events should call the handler method.
 */
@Injectable()
export class GuildFilter implements Filter {
  public readonly allowedGuilds: string[];

  constructor(allowedGuild: string);
  constructor(allowedGuilds: string[]);
  constructor(guilds: string | string[]) {
    if (!Array.isArray(guilds)) {
      guilds = [guilds];
    }

    this.allowedGuilds = guilds;
  }

  filter(ctx: ExecutionContext) {
    return true;
  }
}
