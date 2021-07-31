import {
  Command,
  OnApplicationShutdown,
  OnModuleInit,
  Receiver,
  UserArgument,
} from "@watsonjs/common";

import { AppService } from "./app.service";

@Receiver()
export class AppReceiver implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly appService: AppService) {}

  onModuleInit() {
    console.log(this.appService);
  }

  onApplicationShutdown() {
    console.log("Byee!");
  }

  @Command("ping")
  ping(user: UserArgument) {}
}
