import { Module } from '@watson/common';

import { TestModule } from './test.module';

@Module({
  imports: [TestModule],
})
export class ApplicationModule {}
