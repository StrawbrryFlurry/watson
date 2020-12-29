import { Snowflake } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { CommandContainer, CommandExplorer, CommandProxy } from './command';
import { EventProxy } from './event';
import { ContextRunner } from './lifecycle';

export interface IApplicationProxyOptions {
  acknowledgementEmote?: Snowflake | string;
}

export class ApplicationProxy {
  private commandContainer = new CommandContainer();
  private contextRunner = new ContextRunner();
  private explorer: CommandExplorer;
  private commandProxy: CommandProxy;
  private eventProxies = new Set<EventProxy<any>>();

  constructor(
    explorer: CommandExplorer,
    private options?: IApplicationProxyOptions
  ) {
    this.explorer = explorer;
  }

  public async init(adapter: DiscordJSAdapter) {
    const { commands } = this.explorer;

    for (const command of commands) {
      if (!this.commandContainer.hasRouteApplied(command)) {
        this.commandContainer.applyRoute(command);
      }
    }

    this.commandProxy = new CommandProxy(
      this.commandContainer,
      this.contextRunner,
      this.options
    );

    this.applyProxiesToAdapter(adapter);
  }

  public applyProxiesToAdapter(adapter: DiscordJSAdapter) {
    for (const proxy of this.eventProxies) {
      adapter.registerEventProxy(proxy);
    }

    adapter.registerEventProxy(this.commandProxy);
  }
}
