import { Module } from '@watson/common';

import { TestReceiver } from './test.receiver';
import { TestService } from './test.service';

@Module({
  providers: [TestService],
  receivers: [TestReceiver],
})
export class TestModule {}
