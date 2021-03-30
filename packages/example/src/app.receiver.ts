import { Command, Receiver } from '@watsonjs/common';

import { AppService } from './app.service';

@Receiver()
export class AppReceiver {
  constructor(private readonly appService: AppService) {}

  @Command("ping", { namedPrefix: "pls" })
  ping() {
    return this.appService.ping();
  }
}
