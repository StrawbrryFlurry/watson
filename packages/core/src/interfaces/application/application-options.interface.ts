export type WatsonClientBase = {
  client: any;
  options: any;
};

export type WatsonApplicationOptions<Client extends WatsonClientBase> =
  | WatsonApplicationWithClient<Client>
  | WatsonApplicationWithoutClient<Client>;

interface WatsonApplicationBase {
  description?: string;
}

interface WatsonApplicationWithClient<Client extends WatsonClientBase>
  extends WatsonApplicationBase {
  client: Client["client"];
}

interface WatsonApplicationWithoutClient<Client extends WatsonClientBase>
  extends WatsonApplicationBase {
  authToken?: string;
  clientOptions?: Client["options"];
}
