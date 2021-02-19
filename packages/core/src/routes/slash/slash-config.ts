import { ApplicationCommandOption, PartialApplicationCommand } from '@watsonjs/common';

import { AbstractEventConfiguration } from '../event.configuration';

export class SlashConfiguration extends AbstractEventConfiguration {
  public readonly name: string;
  public readonly description: string;
  public readonly options: ApplicationCommandOption[];

  constructor(config: PartialApplicationCommand) {
    super("INTERACTION_CREATE" as any);

    this.name = config.name;
    this.description = config.description;
    this.options = config.options;
  }
}
