import { ApplicationCommandType } from '@common/decorators/application';
import { SlashCommandParameter } from '@common/router';

import { BaseRoute } from './base-route.interface';

export interface ApplicationCommandRoute extends BaseRoute {
  name: string;
  commandType: ApplicationCommandType;
  parent: ApplicationCommandRoute | null;
  /**
   * The Discord API command id. This property is
   * automatically set by Watson once the
   * application command is mapped / validated
   * through the API during the application
   * bootstrapping process.
   */
  commandId: string | null;
}

export interface ApplicationSlashCommandRoute extends ApplicationCommandRoute {
  params: SlashCommandParameter[];
  children: Map<string, ApplicationSlashCommandRoute>;
}
