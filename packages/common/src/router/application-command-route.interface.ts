import { ApplicationCommandType } from '@common/decorators/application';

import { BaseRoute } from './base-route.interface';
import { ApplicationCommandParameter } from './configuration';

export interface ApplicationCommandRoute extends BaseRoute {
  name: string;
  commandType: ApplicationCommandType;
  parent: ApplicationCommandRoute | null;
}

export interface ApplicationSlashCommandRoute extends ApplicationCommandRoute {
  params: ApplicationCommandParameter[];
  children: Map<string, ApplicationSlashCommandRoute>;
}
