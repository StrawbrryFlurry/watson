import { Interaction } from 'discord.js';

interface ApplicationCommandParameter {}

export interface ParsedApplicationCommand {
  params: Map<string, ApplicationCommandParameter>;
}

export class InteractionParser {
  public parseInteraction(interaction: Interaction) {}
}
