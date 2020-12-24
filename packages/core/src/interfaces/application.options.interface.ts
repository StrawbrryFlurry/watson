import { Client, ClientOptions, Intents } from 'discord.js';

export interface IWatsonApplicationOptions {
  discordAuthToken?: string;
  clientOptions?: ClientOptions;
  botDescription?: string;
  intents?: Intents;
  acknowledgeReaction?: string;
  client?: Client;
}
