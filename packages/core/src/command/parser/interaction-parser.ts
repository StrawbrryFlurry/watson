import { Injector } from '@core/di';
import { CommandInteraction, Interaction, MessageComponentInteraction } from 'discord.js';

interface ApplicationCommandParameter {}

export interface ParsedApplicationCommand {
  params: Map<string, ApplicationCommandParameter>;
}

export class InteractionRouter {
  constructor(private _injector: Injector) {}

  public parseInteraction(interaction: Interaction) {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      return this._handleCommand("" as any);
    }

    if (interaction.isMessageComponent()) {
      return this._handleMessageComponentEvent(interaction);
    }

    // There shouldn't be any other possible type of interaction as of now
    throw new Error("🤷‍♂️");
  }

  private async _handleCommand(interaction: CommandInteraction) {
    const { commandId } = interaction;
  }

  private async _handleMessageComponentEvent(
    interaction: MessageComponentInteraction
  ) {}
}
