import { Module } from '@watson/common';

import { TestReceiver } from './test.receiver';
import { TestService } from './test.service';
import { AdditionalTestModule } from './test2.module';

@Module({
  imports: [AdditionalTestModule],
  providers: [TestService],
  receivers: [TestReceiver],
})
export class TestModule {}
