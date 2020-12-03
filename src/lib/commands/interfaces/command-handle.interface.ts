import { ICommandArgument } from './command-argument.interface';

export interface ICommandHandle {
  prefix: string | null;
  channel: string[] | null;
  commandName: string;
  arguments: ICommandArgument[] | null;
  handle: (...args: any[]) => void;
  _target: Function;
  _propertyName: string;
}
