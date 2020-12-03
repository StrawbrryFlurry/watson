import { ICommandOptions } from '../../decorators/interfaces';

export interface ICommandHandleMetadata {
  readonly target: Function;
  readonly propertyName: string;
  readonly descriptor: PropertyDescriptor;
  readonly options: ICommandOptions;
}
