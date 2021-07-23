import { SLASH_COMMAND_METADATA } from '../../constants';
import { PartialApplicationCommand } from '../../interfaces';

export interface ISlashCommandConfig extends PartialApplicationCommand {}

// https://discordapp.com/oauth2/authorize?client_id=791524746477961276&scope=applications.commands&permissions=0
/**
 *  Marks a method in an receiver as a slash command
 * @param slashConfig Configuration for the slash command
 * @param commandOptions Options the command is configured with
 *
 * @default command The default command name is the descriptor name of the method
 */
export function SlashCommand(
  slashConfig: ISlashCommandConfig
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(
      SLASH_COMMAND_METADATA,
      slashConfig,
      descriptor.value
    );
  };
}
