import { ConfigService } from '@common/builtin';
import { Module } from '@common/decorators/common/module.decorator';
import { DynamicModule, ValueProvider } from '@common/di';
import { isNil } from '@common/utils';
import { DotenvConfigOptions } from 'dotenv';

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
