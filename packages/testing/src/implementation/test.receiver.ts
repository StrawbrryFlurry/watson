import { Command, Receiver } from '@watson/common';

@Receiver({})
export class TestReceiver {
  @Command({})
  doStuff() {}
}
