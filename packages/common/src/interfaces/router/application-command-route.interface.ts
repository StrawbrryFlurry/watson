import { ApplicationCommandType } from '@common/decorators';

import { ApplicationCommandParameter, BaseRoute } from '.';

export interface ApplicationCommandRoute extends BaseRoute {
  name: string;
  commandType: ApplicationCommandType;
}

export interface ApplicationSlashCommandRoute extends ApplicationCommandRoute {
  params: ApplicationCommandParameter[];
}
