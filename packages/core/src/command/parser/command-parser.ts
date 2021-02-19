import { Message } from 'discord.js';

import { CommandTokenizer } from '../tokenizer';
import { CommandArgument, CommandBase, CommandParameter } from './types';

export class CommandParser {
  private tokenizer: CommandTokenizer;
  private validPrefixes = new Set<"">();

  constructor() {
    this.tokenizer = new CommandTokenizer();
  }

  public parse(message: Message) {
    const argumentList = new Set<
      CommandBase | CommandParameter | CommandArgument
    >();

    const tokens = this.tokenizer.tokenize(message);
  }
}
