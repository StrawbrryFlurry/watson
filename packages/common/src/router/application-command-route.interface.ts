import { ApplicationCommandType } from '@common/decorators/application';
import { SlashCommandParameter } from '@common/router';

import { BaseRoute } from './base-route.interface';

export interface ApplicationCommandRoute extends BaseRoute {
  name: string;
  commandType: ApplicationCommandType;
  parent: ApplicationCommandRoute | null;
}

export interface ApplicationSlashCommandRoute extends ApplicationCommandRoute {
  params: SlashCommandParameter[];
  children: Map<string, ApplicationSlashCommandRoute>;
}
