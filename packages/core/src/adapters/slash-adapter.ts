import { ApplicationCommand, PartialApplicationCommand } from '@watson/common';
import Axios, { AxiosInstance } from 'axios';
import { Snowflake } from 'discord.js';

export class SlashCommandAdapter {
  private readonly DISCORD_ENDPOINT = "https://discord.com/api/v8";
  private readonly httpClient: AxiosInstance;
  private readonly tokenPrefix = "Bot ";
  private readonly applicationid: Snowflake;

  constructor(config: { applicationId: Snowflake; authToken: string }) {
    this.applicationid = config.applicationId;
    this.httpClient = Axios.create({
      headers: { Authorization: `${this.tokenPrefix}${config.authToken}` },
    });
  }

  public async getApplicationCommands(guildId?: string) {
    const res = await this.httpClient.get<ApplicationCommand[]>(
      this.getEndpoint(
        guildId
          ? `applications/${this.applicationid}/guilds/${guildId}/commands`
          : `applications/${this.applicationid}/commands`
      )
    );

    return res.data;
  }

  public async createApplicationCommand(
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

    const req = await (method === "POST"
      ? this.httpClient.post<ApplicationCommand>(endpoint, command)
      : this.httpClient.patch(endpoint, command));

    return req.data;
  }

  async editApplicationCommand(
    commandId: string,
    command: PartialApplicationCommand,
    guildId?: string
  ) {
    return await this.createApplicationCommand(command, guildId, commandId);
  }

  public async deleteApplicationCommand(commandId: string, guildId?: string) {
    const request = await this.httpClient.delete(
      this.getEndpoint(
        guildId
          ? `applications/${this.applicationid}/guilds/${guildId}/commands/${commandId}`
          : `applications/${this.applicationid}/commands/${commandId}`
      )
    );

    return request.status == 204;
  }

  private getEndpoint(endpoint: string) {
    return `${this.DISCORD_ENDPOINT}/${endpoint}`;
  }
}
