import { Injectable } from '@decorators/common';
import { config, DotenvConfigOptions } from 'dotenv';

@Injectable()
export class ConfigService {
  protected config: { [key: string]: any };

  constructor(cfg: DotenvConfigOptions | undefined, withConfig: {}[]) {
    let dotEnvConfig = {};

    try {
      const { parsed } = config(cfg);

      if (parsed) {
        dotEnvConfig = parsed;
      }
    } catch (err) {
      console.error(err);
    }

    const loadedConfig = withConfig.reduce(
      (configs, cfg) => ({ ...configs, ...cfg }),
      {}
    );

    this.config = { ...loadedConfig, ...dotEnvConfig };
  }

  /**
   * Get configuration data parsed by the service.
   * Use dot `.` seperated names to retrieve data using this method.
   *
   * @example
   * `service.get("DISCORD_TOKEN")` => The value of a dotenv configuration with the key DISCORD_TOKEN
   *
   * @example
   * `service.get("global.url.api")` => The value of this nested object: { global: { url: api } };
   */
  get<T = any>(path: string): T {
    const segments = path.split(".");
    return segments.reduce(
      (val, segment) => (val = val[segment]),
      this.config
    ) as T;
  }
}
