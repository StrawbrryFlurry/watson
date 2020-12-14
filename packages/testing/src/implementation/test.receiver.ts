import { Command, Inject, Receiver } from "@watson/common";

import { TestService } from "./test.service";
import { DogService } from "./dog.service";
@Receiver()
export class TestReceiver {
  @Command()
  doStuff() {}

  constructor(
    @Inject(DogService) private test: any,
    private test1: TestService
  ) {}
}
