import { MatchingStrategy } from '@watsonjs/common';

export type WatsonClientBase = {
  client: any;
  options: any;
};

export type WatsonApplicationOptions<Client extends WatsonClientBase> =
  | WatsonApplicationWithClient<Client>
  | WatsonApplicationWithoutClient<Client>;

interface WatsonApplicationBase {
  description?: string;
  commandMatchingStrategy?: MatchingStrategy;
  globalCommandPrefix?: string;
}

interface WatsonApplicationWithClient<Client extends WatsonClientBase>
  extends WatsonApplicationBase {
  client: Client["client"];
}

interface WatsonApplicationWithoutClient<Client extends WatsonClientBase>
  extends WatsonApplicationBase {
  discordToken?: string;
  clientOptions?: Client["options"];
}
