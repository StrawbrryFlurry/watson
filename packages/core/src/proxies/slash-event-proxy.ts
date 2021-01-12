import { EventProxy } from 'event';

type SlashCommandEventType = any;

export interface SlashCommandEvent {
  version: number;
  type: number;
  token: string;
  member: any;
  id: string;
  guild_id: string;
  data: { name: string; id: string };
  channel_id: string;
}

export class SlashCommandsEventProxy extends EventProxy<SlashCommandEventType> {
  constructor() {
    super("INTERACTION_CREATE", true);
  }

  public async proxy(data: SlashCommandEvent, shardID: string) {}
}
