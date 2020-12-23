import { Message } from 'discord.js';

import { CommandLifecycleZone } from '../exceptions';
import { Injector } from '../injector';
import { CommandContext } from './command-context';
import { CommandExplorer } from './command-explorer';

export class CommandRouter {
  private explorer: CommandExplorer;
  private injector = new Injector();

  public async route(message: Message) {
    const handles = this.explorer.getHandles(message);

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
