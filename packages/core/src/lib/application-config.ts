import { WatsonApplicationOptions } from '@core/interfaces';
import { MatchingStrategy, mergeDefaults } from '@watsonjs/common';

const DEFAULT_WATSON_OPTIONS: Partial<WatsonApplicationOptions<any>> = {
  commandMatchingStrategy: MatchingStrategy.Static,
};

export class ApplicationConfig {
  public discordToken?: string;
  public description?: string;
  public globalCommandPrefix?: string;

  public commandMatchingStrategy!: MatchingStrategy;

  public assignOptions(
    options: Partial<WatsonApplicationOptions<any>> | undefined
  ) {
    const withDefault = mergeDefaults(options ?? {}, DEFAULT_WATSON_OPTIONS);
    Object.assign(this, withDefault);
  }
}
