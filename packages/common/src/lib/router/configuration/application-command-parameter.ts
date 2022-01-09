import { CommandParameterType } from '@common/command/parameter-types';
import { SlashCommandParameterMetadata } from '@common/decorators';

/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
 */
export enum SlashCommandParameterApiType {
  /*
  SubCommand = 1,
  SubCommandGroup = 2,
  */
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
}

export type SlashCommandParameter<T = any> =
  SlashCommandParameterMetadata<T> & {
    apiType: SlashCommandParameterApiType;
    /**
     * Internal parameter type
     */
    paramType: CommandParameterType;
  };
