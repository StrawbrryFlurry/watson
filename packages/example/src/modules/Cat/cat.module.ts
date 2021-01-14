import { Module } from '@watson/common';

import { DogModule } from '../Dog/dog.module';
import { CatReceiver } from './cat.receiver';
import { CatService } from './cat.service';

@Module({
  providers: [CatService],
  receivers: [CatReceiver],
  exports: [CatService],
  imports: [DogModule],
})
export class CatModule {}
