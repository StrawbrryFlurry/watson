import { Message } from 'discord.js';

import { EventProxy } from '../event';
import { CommandParamsFactory } from './command-params-factory';

export class CommandProxy extends EventProxy<"message"> {
  public commandRoutes;
  private commandParamsFactory = new CommandParamsFactory();

  constructor() {
    super("message");
  }

  public proxy(message: Message) {}

  public addAcknowledgementEmote() {}
}
