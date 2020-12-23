import { RECEIVER_OPTIONS_METADATA } from '../../constants';
import { isObject, isString } from '../../utils/shared.utils';

export interface IReceiverCommandOptions {
  casesensitive?: boolean;
}

export interface IReceiverOptions {
  commandOptions?: IReceiverCommandOptions;
  prefix?: string;
}

/**
 * @param prefix The prefix to be used by the underlying commands
 * @param commandOptions Configurable options for the underlying commands
 */
export function Receiver(): ClassDecorator;
export function Receiver(prefix?: string): ClassDecorator;
export function Receiver(reciverOptions: IReceiverOptions): ClassDecorator;
export function Receiver(arg?: string | IReceiverOptions): ClassDecorator {
  let options: Partial<IReceiverOptions> = {};
  if (isString(arg)) {
    options["prefix"] = arg;
  } else if (isObject(arg)) {
    options = arg;
  }

  return (target: Object) => {
    Reflect.defineMetadata(RECEIVER_OPTIONS_METADATA, options, target);
  };
}
