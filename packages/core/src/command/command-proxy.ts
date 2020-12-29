import { isEmpty } from '@watson/common';
import { Message, Snowflake } from 'discord.js';

import { EventProxy } from '../event';
import { ContextRunner } from '../lifecycle';
import { CommandContainer } from './command-container';

export interface ICommandProxyOptions {
  acknowledgementEmote?: string | Snowflake;
}

export class CommandProxy extends EventProxy<"message"> {
  private commandContainer: CommandContainer;
  private acknowledgementEmote: Snowflake | string;
  private contextRunner: ContextRunner;

  constructor(
    container: CommandContainer,
    contextRunner: ContextRunner,
    options?: ICommandProxyOptions
  ) {
    super("message");

    this.contextRunner = contextRunner;
    this.commandContainer = container;

    this.configure(options);
  }

  public async proxy(message: Message) {
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
