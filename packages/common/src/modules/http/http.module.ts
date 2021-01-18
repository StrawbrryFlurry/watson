import { AxiosRequestConfig } from 'axios';
import { DynamicModule, FactoryProvider, ValueProvider } from 'interfaces';

import { Module } from '../../decorators';
import { httpClientFactory } from './http-client.provider';
import { HttpClient } from './http.service';

const customProvider: FactoryProvider = {
  provide: HttpClient,
  useFactory: httpClientFactory,
};

@Module({
  providers: [customProvider],
  exports: [customProvider],
})
export class HttpModule {
  static forConfig(config: AxiosRequestConfig): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: "HTTP_CONFIG",
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
