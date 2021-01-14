import { Client, Guild } from 'discord.js';

export interface ContextData {
  /**
   * The guild the command was used in.
   * `undefined` if the command was used in a DM.
   */
  guild: Guild;
  /**
   * The client that emitted the event.
   */
  client: Client;
}
