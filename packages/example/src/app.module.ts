import { Module } from '@watsonjs/common';

import { AppReceiver } from './app.receiver';
import { AppService } from './app.service';
import { InquirableExampleModule } from './modules/inquirables/inquirable-example.module';
import { ProviderExampleModule } from './modules/providers/provider-example.module';

@Module({
  imports: [ProviderExampleModule, InquirableExampleModule],
  providers: [AppService],
  receivers: [AppReceiver],
})
export class ApplicationModule {}
