import { Guild, User } from 'discord.js';

export interface CommandContextData {
  args: {
    [key: string]: any;
  };
  guild: Guild;
  user: User;
  messageContent: string;
  command: string;
  prefix: string;
}
