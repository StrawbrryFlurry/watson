import { Client, ClientOptions, Intents, Snowflake } from 'discord.js';

export interface WatsonApplicationOptions {
  discordAuthToken?: string;
  clientOptions?: ClientOptions;
  botDescription?: string;
  intents?: Intents;
  acknowledgeReaction?: string;
  client?: Client;
  acknowledgementReaction?: string | Snowflake;
}
