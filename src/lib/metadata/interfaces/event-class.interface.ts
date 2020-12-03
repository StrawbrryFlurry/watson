import { IBotEventOptions } from '../../decorators';

export interface IEventClassMetadata {
  target: Function;
  options?: IBotEventOptions;
}
