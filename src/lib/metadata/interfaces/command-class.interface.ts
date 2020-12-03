import { IBotCommandOptions } from '../../decorators';

export interface ICommandClassMetadata {
  target: Function;
  options?: IBotCommandOptions;
}
