import { Snowflake } from 'discord.js';

import { ApplicationCommandOption } from './application-command-options.interface';

export type ApplicationCommand = {
  id: Snowflake;
  application_id: Snowflake;
  name: string;
  description: string;
  options: ApplicationCommandOption[];
};

export type PartialApplicationCommand = {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
};
