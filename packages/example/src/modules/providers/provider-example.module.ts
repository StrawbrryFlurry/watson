import { Global, HttpModule, Module } from '@watsonjs/common';

import { ExampleClassProvider } from './class.provider';
import { ExampleService } from './example.service';
import { ExampleFactoryProvider } from './factory.provider';
import { ExampleValueProvider } from './value.provider';

@Global()
@Module({
  providers: [
    ExampleClassProvider,
    ExampleFactoryProvider,
    ExampleValueProvider,
    ExampleService,
  ],
  imports: [HttpModule],
  exports: [
    ExampleClassProvider,
    ExampleFactoryProvider,
    ExampleValueProvider,
    ExampleService,
  ],
})
export class ProviderExampleModule {}
