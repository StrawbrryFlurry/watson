import { Message } from 'discord.js';

import { CommandRoute } from '../../routes';
import { CommandArgumentHost } from './command-argument-host';

export class CommandPipeline {
  public argumentHost: CommandArgumentHost;
  public route: CommandRoute;
  public message: Message;

  constructor(route: CommandRoute) {
    this.route = route;
    this.argumentHost = new CommandArgumentHost(route);
  }

  public invokeFromMessage(message: Message) {
    this.argumentHost.parseMessage(message);

    /* Parse first token + prefix */
    /* Check with the command container */
  }
}
