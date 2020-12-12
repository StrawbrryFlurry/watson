import { Message } from 'discord.js';

import { WatsonContainer } from '../watson-container';

export class CommandParser {
  private context: WatsonContainer;

  public CommandParser(context: WatsonContainer) {
    this.context = context;
  }

  public parse(message: Message) {
    // Check if prefix matches (maybe)
    // Check if command registered
    // Check if command takes subcommand
    // Parse agruments according to specification
  }
}
