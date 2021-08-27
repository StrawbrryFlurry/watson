import { RECEIVER_METADATA } from '../../constants';
import { Prefix } from '../../interfaces';
import { isNil, isObject, isString } from '../../utils/shared.utils';

export interface ReceiverOptions {
  /**
   * The prefix for underlying commands if none is specified.
   *
   * @example
   * !ban @username
   * Where `!` is the prefix
   */
  prefix?: string | Prefix;
  /**
   * The command group underlying commands will be mapped to.
   *
   * @example
   * `Help`
   */
  groupName?: string;
}

export function Receiver(): ClassDecorator;
/**
 * @param commandGroup The group all underyling commands will be mapped to.
 * @default commandGroup the name of the receiver without the `Receiver` suffix.
 */
export function Receiver(group?: string): ClassDecorator;
/**
 * Receiver options can be used to apply configuration to the underlying
 * event handlers.
 */
export function Receiver(reciverOptions: ReceiverOptions): ClassDecorator;
export function Receiver(arg?: string | ReceiverOptions): ClassDecorator {
  return (target: Function) => {
    let options: Partial<ReceiverOptions> = {};

    if (isString(arg)) {
      options["groupName"] = arg;
    } else if (isObject(arg)) {
      options = {
        ...arg,
        groupName: isNil(arg.groupName)
          ? target.name.replace("Receiver", "")
          : arg.groupName,
      };
    }

    Reflect.defineMetadata(RECEIVER_METADATA, options, target);
  };
}
