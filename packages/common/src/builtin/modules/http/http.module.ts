import { Module } from '@common/decorators';
import { DynamicModule, FactoryProvider, InjectionToken, ValueProvider } from '@common/interfaces';
import { AxiosRequestConfig } from 'axios';

import { httpClientFactory } from './http-client.provider';
import { HttpClient } from './http.service';

const customProvider: FactoryProvider = {
  provide: HttpClient,
  useFactory: httpClientFactory,
};

export const HTTP_CONFIG = new InjectionToken("HTTP client configuration", {
  providedIn: "root",
});

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
