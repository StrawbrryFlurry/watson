import { ApplicationCommandType } from '@common/decorators';

import { ApplicationCommandParameter, BaseRoute } from '.';

export interface ApplicationCommandRoute extends BaseRoute {
  name: string;
  commandType: ApplicationCommandType;
  parent: ApplicationCommandRoute | null;
}

export interface ApplicationSlashCommandRoute extends ApplicationCommandRoute {
  params: ApplicationCommandParameter[];
}
