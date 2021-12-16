import { SlashCommandMetadata } from '@common/decorators';
import { NullableT } from '@common/utils';

export interface ApplicationCommandConfiguration
  extends NullableT<SlashCommandMetadata, "description"> {}
