import { Module } from '@watson/common';

import { AppReceiver } from './app.receiver';
import { AppService } from './app.service';

@Module({
  imports: [],
  providers: [AppService],
  receivers: [AppReceiver],
})
export class ApplicationModule {}
