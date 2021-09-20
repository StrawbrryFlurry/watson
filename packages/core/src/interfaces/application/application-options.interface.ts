import { Client, ClientOptions } from 'discord.js';

export type WatsonApplicationOptions =
  | WatsonApplicationWithClient
  | WatsonApplicationWithoutClient;

interface WatsonApplicationBase {
  description?: string;
}

interface WatsonApplicationWithClient extends WatsonApplicationBase {
  client: Client;
}

interface WatsonApplicationWithoutClient extends WatsonApplicationBase {
  authToken?: string;
  clientOptions?: ClientOptions;
}
