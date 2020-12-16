import { Module } from '@watson/common';

import { CatModule } from './Cat/cat.module';
import { DogModule } from './Dog/dog.module';

@Module({
  imports: [DogModule, CatModule],
})
export class ApplicationModule {}
