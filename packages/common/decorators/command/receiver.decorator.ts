import { RECEIVER_OPTIONS_METADATA } from '../../constants';
import { isUndefined } from '../../utils';

export interface IReciverOptions {}

export function Receiver(reciverOptions?: IReciverOptions): ClassDecorator {
  const options = isUndefined(reciverOptions) ? undefined : reciverOptions;

  return (target: Object) => {
    Reflect.defineMetadata(RECEIVER_OPTIONS_METADATA, options, target);
  };
}
