import { ICommandOptions } from '../decorators';

export interface ICommandHandle {
  readonly target: Function;
  readonly propertyName: string;
  readonly descriptor: PropertyDescriptor;
  readonly options: ICommandOptions;
}
