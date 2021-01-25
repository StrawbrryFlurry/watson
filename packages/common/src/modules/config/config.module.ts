import { DotenvConfigOptions } from "dotenv";

import { Module } from "../../decorators";
import { DynamicModule, ValueProvider } from "../../interfaces";
import { isNil } from "../../utils";
import { ConfigService } from "./config.service";

export interface IConfigModuleOptions<T = any> {
  dotEnv?: DotenvConfigOptions;
  global?: boolean;
  withConfig?: T[];
}

@Module()
export class ConfigModule {
  public static forConfig(): DynamicModule;
  public static forConfig(options?: IConfigModuleOptions): DynamicModule;
  public static forConfig(options?: IConfigModuleOptions): DynamicModule {
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
