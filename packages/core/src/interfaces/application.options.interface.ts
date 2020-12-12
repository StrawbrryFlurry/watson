import { ClientOptions } from 'discord.js';

export interface IWatsonApplicationOptions {
  discordAuthToken: string;
  clientOptions?: ClientOptions;
}
