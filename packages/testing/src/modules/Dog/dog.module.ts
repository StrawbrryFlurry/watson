import { DynamicModule, Module } from '@watson/common';

import { CatService } from '../Cat/cat.service';
import { DogReceiver } from './dog.receiver';
import { DogService } from './dog.service';

@Module()
export class DogModule {
  static register(): DynamicModule {
    return {
      module: DogModule,
      imports: [],
      providers: [DogService, CatService],
      receivers: [DogReceiver],
      exports: [DogService],
    };
  }
}
