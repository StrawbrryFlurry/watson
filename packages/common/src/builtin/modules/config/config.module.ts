import { ConfigService } from '@builtin';
import { Module } from '@decorators/common';
import { DynamicModule, ValueProvider } from '@interfaces/common';
import { DotenvConfigOptions } from 'dotenv';
import { isNil } from 'packages/common/src';

export interface ConfigModuleOptions<T = any> {
  dotEnv?: DotenvConfigOptions;
  global?: boolean;
  withConfig?: T[];
}

@Module()
export class ConfigModule {
  public static forConfig(): DynamicModule;
  public static forConfig(options?: ConfigModuleOptions): DynamicModule;
  public static forConfig(options?: ConfigModuleOptions): DynamicModule {
    if (isNil(options)) {
      options = {};
    }

    const { dotEnv = undefined, global = false, withConfig = [] } = options;

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
