import { Message } from 'discord.js';

import { CommandLifecycleZone } from '../exceptions';
import { CommandContext } from './command-context';
import { CommandExplorer } from './command-explorer';

export class CommandRouter {
  private explorer: CommandExplorer;

  public async route(message: Message) {
    const handles = this.explorer.getRoute(message);

    if (handles.length === 0) {
      return;
    }

    for (const handle of handles) {
      CommandLifecycleZone.runAsync(async () => {
        const context = new CommandContext(message);
        context.commandHandle = handle;
      });
    }
  }

  private async execute(ctx: CommandContext) {}

  constructor(explorer: CommandExplorer) {
    this.explorer = explorer;
  }
}
