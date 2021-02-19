import { Message } from 'discord.js';

import { CommandRoute } from '../../routes';
import { CommandToken, CommandTokenizer } from '../tokenizer';

export class CommandArgumentHost {
  public message: Message;
  public argumentList: any[];
  public pendingArguments: any[];

  public tokenizer = new CommandTokenizer();
  public route: CommandRoute;

  public tokens: CommandToken[];

  constructor(route: CommandRoute) {
    this.route = route;
  }

  public parseMessage(message: Message) {
    this.message = message;

    const tokenList = this.tokenizer.tokenize(message);
    this.tokens = tokenList.tokens;
  }
}
