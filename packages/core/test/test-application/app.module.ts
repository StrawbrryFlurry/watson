import { Module } from '@watsonjs/common';

import { HatsModule } from './hats';

@Module({
  imports: [HatsModule],
})
export class AppModule {}
