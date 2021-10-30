import { CommandParameterType } from '@common/interfaces';

/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
 */
export enum ApplicationCommandParameterType {
  SubCommand = 1,
  SubCommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
  Mentionable = 9,
  Number = 10,
}

export interface ApplicationCommandParameter {
  name: string;
  description: string;
  type: ApplicationCommandParameterType;
  parameterType: CommandParameterType;
  optional: boolean;
}
