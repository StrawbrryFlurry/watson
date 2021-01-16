import { MessageEmbed } from 'discord.js';

type IValidReturnType = string | MessageEmbed;

export type IReturnValue = IValidReturnType | (() => IValidReturnType);
