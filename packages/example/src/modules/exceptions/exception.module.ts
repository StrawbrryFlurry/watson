import { Module } from '@watsonjs/common';

import { ExceptionsReceiver } from './exception.receiver';

@Module({
  receivers: [ExceptionsReceiver],
})
export class ExceptionsModule {}
