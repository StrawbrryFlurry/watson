import { Module } from '@watsonjs/common';

import { KickUserReceiver } from './kick-user.receiver';

@Module({
  receivers: [KickUserReceiver],
})
export class ConfigurablesExampleModule {}
