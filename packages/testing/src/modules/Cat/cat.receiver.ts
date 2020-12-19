import { Command, Receiver } from '@watson/common';

@Receiver()
export class CatReceiver {
  @Command()
  getCat() {}
}
