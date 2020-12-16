import { Module } from '@watson/common';

import { CatService } from '../Cat/cat.service';
import { DogReceiver } from './dog.receiver';
import { DogService } from './dog.service';

@Module({
  imports: [],
  providers: [DogService, CatService],
  receivers: [DogReceiver],
  exports: [DogService],
})
export class DogModule {}
