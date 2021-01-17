import { DotenvConfigOptions } from 'dotenv';
import { DynamicModule, ValueProvider } from 'interfaces';

import { Module } from '../../decorators';
import { ConfigService } from './config.service';

export interface IConfigModuleOptions<T = any> {
  dotEnv: DotenvConfigOptions;
  global: boolean;
  withConfig: T[];
}

@Module()
export class ConfigModule {
  public static forRoot({
    dotEnv,
    global = false,
    withConfig = [],
  }: IConfigModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(dotEnv, withConfig),
        } as ValueProvider,
      ],
      global: global,
    };
  }
}
