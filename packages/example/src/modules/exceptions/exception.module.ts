import { Module } from '@watsonjs/common';

import { ExceptionsReceiver } from './exception.receiver';

@Module({
  imports: [],
  receivers: [ExceptionsReceiver],
  providers: [],
  exports: [],
})
export class ExceptionsModule {}
