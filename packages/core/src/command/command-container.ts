import { Message } from 'discord.js';

import { CommandRoute } from './command-route';

export class CommandContainer {
  private commandBucket = new Set<CommandRoute>();

  public getMatchingCommands(message: Message) {
    const matchingCommands: CommandRoute[] = [];

    for (const route of this.commandBucket) {
      if (route.matchesMessage(message)) {
        matchingCommands.push(route);
      }
    }

    return matchingCommands;
  }

  public applyRoute(route: CommandRoute) {
    this.commandBucket.add(route);
  }

  public hasRouteApplied(route: CommandRoute) {
    return this.commandBucket.has(route);
  }
}
