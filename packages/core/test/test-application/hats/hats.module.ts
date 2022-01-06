import { Module } from '@watsonjs/common';

import { HatsRouter } from './hats.router';

@Module({
  routers: [HatsRouter],
})
export class HatsModule {}
