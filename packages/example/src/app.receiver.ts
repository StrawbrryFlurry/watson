import {
  Command,
  CommandArgumentType,
  CommandPrefix,
  InjectParam,
  OnApplicationShutdown,
  OnModuleInit,
  Receiver,
} from '@watsonjs/common';
import { User } from 'discord.js';

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
    params: [{ name: "user", type: CommandArgumentType.USER }],
  })
  ping(@InjectParam("user") user: User) {}

  @Command("ping")
  ping(
    @Param({
      /*  */
    })
    user: UserArgument
  ) {}

  @Command("s", {
    prefix: new p(),
  })
  stuff() {}
}
