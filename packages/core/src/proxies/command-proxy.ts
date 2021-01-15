import { Message } from 'discord.js';

import { EventProxy } from '../event';

export class CommandProxy extends EventProxy<"message"> {
  constructor() {
    super("message");
  }

  public async proxy(message: [Message]) {
    return;
  }
}
