import { EventException } from '@watsonjs/common';
import { MessageEmbed } from 'discord.js';

const CUSTOM_EMBED = new MessageEmbed();
CUSTOM_EMBED.title = "A custom exception was thrown! :0";

export class CustomException extends EventException {
  constructor() {
    super(CUSTOM_EMBED);
  }
}
