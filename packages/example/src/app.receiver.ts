import {
  Command,
  CommandArgumentType,
  CommandPrefix,
  InjectParam,
  OnApplicationShutdown,
  OnModuleInit,
  Receiver,
} from '@watsonjs/common';

import { AppService } from './app.service';

class p implements CommandPrefix {
  async getPrefix() {
    return "a";
  }
}

@Receiver()
export class AppReceiver implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly appService: AppService) {}

  onModuleInit() {
    console.log(this.appService);
  }

  onApplicationShutdown() {
    console.log("Down");
  }

  @Command("ping", {
    namedPrefix: "pls",
    params: [{ name: "Name", type: CommandArgumentType.CHANNEL, hungry: true }],
  })
  ping(@InjectParam() param: any) {
    console.log(param);
    return this.appService.ping();
  }

  @Command("s", {
    prefix: new p(),
  })
  stuff() {}

  @Command()
  s(param: Object) {}

  @Command()
  b(param: p) {}

  @Command()
  asd(param: string) {}

  @Command()
  aasd(param: any) {}

  @Command()
  test(param: AppService, something: string): string {
    return "";
  }
}
