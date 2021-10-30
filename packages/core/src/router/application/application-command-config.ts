import { MethodDescriptor } from '@core/di';
import {
  ApplicationCommandMetadata,
  ApplicationCommandRoute,
  ApplicationCommandType,
  ReceiverOptions,
  SlashCommandMetadata,
} from '@watsonjs/common';

export class ApplicationCommandConfig {
  public name: string;
  public type: ApplicationCommandType;

  constructor(
    public host: ApplicationCommandRoute,
    private options: ApplicationCommandMetadata | SlashCommandMetadata,
    private receiverOptions: ReceiverOptions,
    private method: MethodDescriptor
  ) {}
}
