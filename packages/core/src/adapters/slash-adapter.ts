import { ApplicationCommand, HttpClient, PartialApplicationCommand } from '@watsonjs/common';
import { Snowflake } from 'discord.js';
import { map } from 'rxjs/operators';

import { DISCORD_API_URL, DISCORD_GATEWAY_VERSION, DISCORD_TOKEN_PREFIX, DISCORD_URL } from '../constants';
import { containerInstanceHelper } from '../helpers';
import { WatsonContainer } from '../watson-container';

export class SlashCommandAdapter {
  private readonly applicationid: Snowflake;
  private readonly authToken: string;

  private http: HttpClient;

  constructor(config: { applicationId: Snowflake; authToken: string }) {
    this.applicationid = config.applicationId;
    this.authToken = config.authToken;
  }

  public async init(container: WatsonContainer) {
    this.http = await containerInstanceHelper(container, HttpClient);
    await this.http.updateInstance(
      (instance) =>
        (instance.defaults.headers = {
          Authorization: `${DISCORD_TOKEN_PREFIX}${this.authToken}`,
        })
    );
  }

  public getApplicationCommands(guildId?: string) {
    return this.http
      .get<ApplicationCommand[]>(
        this.getEndpoint(
          guildId
            ? `applications/${this.applicationid}/guilds/${guildId}/commands`
            : `applications/${this.applicationid}/commands`
        )
      )
      .pipe(map((res) => res.data))
      .toPromise();
  }

  public createApplicationCommand(
    command: PartialApplicationCommand,
    guildId?: string,
    commandId?: string
  ) {
    const suffix = commandId ? `${commandId}` : "";
    const method = commandId ? "PATCH" : "POST";
    const endpoint = this.getEndpoint(
      guildId
        ? `applications/${this.applicationid}/guilds/${guildId}/commands/${suffix}`
        : `applications/${this.applicationid}/commands/${suffix}`
    );

    const res =
      method === "POST"
        ? this.http.post<ApplicationCommand>(endpoint, command)
        : this.http.patch(endpoint, command);

    res.pipe(map((res) => res.data)).toPromise();
  }

  public async editApplicationCommand(
    commandId: string,
    command: PartialApplicationCommand,
    guildId?: string
  ) {
    return this.createApplicationCommand(command, guildId, commandId);
  }

  public async deleteApplicationCommand(commandId: string, guildId?: string) {
    const status = await this.http
      .delete(
        this.getEndpoint(
          guildId
            ? `applications/${this.applicationid}/guilds/${guildId}/commands/${commandId}`
            : `applications/${this.applicationid}/commands/${commandId}`
        )
      )
      .pipe(map((res) => res.status))
      .toPromise();

    return status == 204;
  }

  private getEndpoint(endpoint: string) {
    return `${DISCORD_URL}/${DISCORD_API_URL}/${DISCORD_GATEWAY_VERSION}/${endpoint}`;
  }
}
