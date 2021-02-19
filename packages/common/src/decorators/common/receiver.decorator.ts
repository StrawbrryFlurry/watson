import { CommandPrefix } from '../../command/common/command-prefix';
import { RECEIVER_METADATA } from '../../constants';
import { isObject, isString } from '../../utils/shared.utils';

export interface IReceiverOptions {
  /**
   * The prefix for underlying commands if none is specified.
   */
  prefix?: string | CommandPrefix;
  /**
   * The command group underlying commands will be mapped to.
   */
  groupName?: string;
}

export function Receiver(): ClassDecorator;
/**
 * @param commandGroup The group all underyling commands will be mapped to.
 * @default commandGroup the name of the receiver.
 */
export function Receiver(group?: string): ClassDecorator;
/**
 * Receiver options can be used to apply configuration to the underlying
 * event handlers.
 */
export function Receiver(reciverOptions: IReceiverOptions): ClassDecorator;
export function Receiver(arg?: string | IReceiverOptions): ClassDecorator {
  return (target: Object) => {
    let options: Partial<IReceiverOptions> = {};

    if (isString(arg)) {
      options["groupName"] = arg;
    } else if (isObject(arg)) {
      options = arg;
    }

    Reflect.defineMetadata(RECEIVER_METADATA, options, target);
  };
}
