import { DynamicModule, Module } from '@common/decorators';
import { FactoryProvider, ValueProvider } from '@watsonjs/di';
import { AxiosRequestConfig } from 'axios';

import { httpClientFactory } from './http-client.provider';
import { HTTP_CONFIG } from './http-config.token';
import { HttpClient } from './http.service';

const customProvider: FactoryProvider = {
  provide: HttpClient,
  useFactory: httpClientFactory,
};

@Module({
  providers: [customProvider],
  exports: [HttpClient],
})
export class HttpModule {
  static forConfig(config: AxiosRequestConfig): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: HTTP_CONFIG,
          useValue: config,
        } as ValueProvider,
        {
          provide: HttpClient,
          useFactory: httpClientFactory,
          inject: ["HTTP_CONFIG"],
        } as FactoryProvider,
      ],
    };
  }
}
