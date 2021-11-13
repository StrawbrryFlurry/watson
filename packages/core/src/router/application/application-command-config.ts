import { MethodDescriptor } from '@core/di';
import {
  ApplicationCommandMetadata,
  ApplicationCommandParameter,
  ApplicationCommandRoute,
  ApplicationCommandType,
  RouterOptions,
  SlashCommandMetadata,
} from '@watsonjs/common';

export class ApplicationCommandConfig {
  public name: string;
  public type: ApplicationCommandType;

  public params: ApplicationCommandParameter[];

  constructor(
    public host: ApplicationCommandRoute,
    private options: ApplicationCommandMetadata | SlashCommandMetadata,
    private routerOptions: RouterOptions,
    private method: MethodDescriptor
  ) {}
}
