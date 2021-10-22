import { AdapterRef } from '@core/adapters';
import { ExceptionHandler } from '@core/lifecycle';
import { CanActivate, PassThrough, PipeTransform, UniqueTypeArray, WatsonInterceptor } from '@watsonjs/common';

import { WatsonApplicationOptions } from './interfaces';

export class ApplicationConfig<DiscordClient = any, ClientOptions = any> {
  public clientOptions: ClientOptions;
  public clientAdapter: AdapterRef;
  public client: DiscordClient;

  public discordToken: string;
  public description: string;
  public globalCommandPrefix: string;

  public globalGuards = new UniqueTypeArray<CanActivate>();
  public globalPipes = new UniqueTypeArray<PipeTransform>();
  public globalFilters = new UniqueTypeArray<PassThrough>();
  public globalInterceptors = new UniqueTypeArray<WatsonInterceptor>();
  public globalExceptionHandlers = new UniqueTypeArray<ExceptionHandler>();

  public assignOptions(options: Partial<WatsonApplicationOptions> | undefined) {
    Object.assign(this, options);
  }
}
