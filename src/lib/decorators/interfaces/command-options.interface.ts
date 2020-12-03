import { ICommandArgument } from '../../commands';

export interface ICommandOptions {
  name: string;
  arguments?: ICommandArgument[];
  channel?: string[];
  prefix?: string;
}
