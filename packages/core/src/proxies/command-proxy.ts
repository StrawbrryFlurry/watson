import { CommandContextData, isEmpty } from '@watson/common';
import { Message, Snowflake } from 'discord.js';
import { IContextFactory } from 'lifecycle/execution-context-factory';
import { CommandRoute } from 'routes';

import { CommandContainer } from '../command/command-container';
import { EventProxy } from '../event';
import { ContextRunner } from '../lifecycle';

export class CommandProxy extends EventProxy<"message"> {
  private commandContainer: CommandContainer;
  private acknowledgementEmote: Snowflake | string;
  private contextRunner: ContextRunner;

  private commands: Map<CommandRoute, IContextFactory<CommandContextData>>;

  constructor(container: CommandContainer, contextRunner: ContextRunner) {
    super("message");

    this.contextRunner = contextRunner;
    this.commandContainer = container;

    this.configure(options);
  }

  public async proxy(message: Message) {
    // Test for matching commands
    // Get command ContextFactory from map
    // Run Context
    const commands = this.commandContainer.getMatchingCommands(message);

    if (!isEmpty(commands)) {
      this.addAcknowledgementEmote(message);
    }

    for (const command of commands) {
      this.contextRunner.runCommand(command, message);
    }
  }

  private configure(options: ICommandProxyOptions) {
    if (typeof options === "undefined") {
      return;
    }

    if (typeof options.acknowledgementEmote !== "undefined") {
      this.acknowledgementEmote = options.acknowledgementEmote;
    }
  }

  private addAcknowledgementEmote(message: Message) {
    if (this.hasAcknowledgementEmote) {
      message.react(this.acknowledgementEmote);
    }
  }

  private get hasAcknowledgementEmote() {
    return !!this.acknowledgementEmote;
  }
}
