import { MetadataResolver } from '@watson/core';

import { ApplicationModule } from './implementation/app.module';

const m = ApplicationModule;
const resolver = new MetadataResolver();

const {
  imports: [i],
} = resolver.resolveModuleMetadata(m);
console.log(resolver.resolveModuleMetadata(i));
