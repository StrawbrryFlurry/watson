import { IEventOptions } from '../../decorators';

export interface IEventHandleMetadata {
  readonly target: Function;
  readonly propertyName: string;
  readonly descriptor: PropertyDescriptor;
  readonly options: IEventOptions<any>;
}
