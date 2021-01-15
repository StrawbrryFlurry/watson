import { Injectable } from 'decorators';
import { config, DotenvConfigOptions } from 'dotenv/types';

@Injectable()
export class ConfigService {
  protected config: { [key: string]: any };

  constructor(cfg: DotenvConfigOptions, withConfig: {}[]) {
    const dotEnvConfig = config(cfg);
    const loadedConfig = withConfig.reduce(
      (configs, cfg) => ({ ...configs, cfg }),
      {}
    );
    this.config = { ...loadedConfig, ...dotEnvConfig };
  }

  get<T = any>(path: string): T {
    const segments = path.split(".");
    return segments.reduce((val, segment) => (val = val[segment]), this.config);
  }
}
