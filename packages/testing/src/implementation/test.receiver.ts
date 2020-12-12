import { Command, Receiver } from '@watson/common';

import { TestService } from './test.service';

@Receiver()
export class TestReceiver {
  @Command()
  doStuff() {}

  constructor(private test: TestService, private test1: TestService) {}
}
