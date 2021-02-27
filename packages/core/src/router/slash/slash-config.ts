import { ApplicationCommandOption, PartialApplicationCommand } from '@watsonjs/common';

export class SlashConfiguration {
  public readonly name: string;
  public readonly description: string;
  public readonly options: ApplicationCommandOption[];

  constructor(config: PartialApplicationCommand) {
    this.name = config.name;
    this.description = config.description;
    this.options = config.options;
  }
}
