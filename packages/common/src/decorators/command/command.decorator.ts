import { isObject, isString } from 'class-validator';
import { MessageEmbed } from 'discord.js';

import { COMMAND_OPTIONS_METADATA } from '../../constants';
import { CommandArgumentType } from '../../enums';

export interface ICommandParam {
  name: string;
  type: CommandArgumentType;
  optional?: boolean;
  encapsulator?: string;
  hungry?: boolean;
  defautl?: any;
  promt?: ICommandPromt;
}

export interface ICommandPromt {
  text: (ctx: unknown) => string | MessageEmbed;
  retryText: (ctx: unknown) => string | MessageEmbed;
  tries?: number;
  timeout?: number;
}

export interface ICommandOptions {
  command?: string;
  alias?: string[];
  params?: ICommandParam[];
}

export function Command(): MethodDecorator;
export function Command(command: string): MethodDecorator;
export function Command(commandOptions: ICommandOptions): MethodDecorator;
export function Command(command?: string | ICommandOptions): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    let options: ICommandOptions = {};

    if (isString(command)) {
      options["command"] = command;
    } else if (isObject(command)) {
      options = command;
    }

    Reflect.defineMetadata(COMMAND_OPTIONS_METADATA, options, descriptor.value);
  };
}
