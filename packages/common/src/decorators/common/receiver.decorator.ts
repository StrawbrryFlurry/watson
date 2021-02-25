import { RECEIVER_METADATA } from '../../constants';
import { CommandPrefix } from '../../interfaces';
import { isNil, isObject, isString } from '../../utils/shared.utils';

export interface IReceiverOptions {
  /**
   * The prefix for underlying commands if none is specified.
   *
   * @example
   * !ban @username
   * Where `!` is the prefix
   */
  prefix?: string | CommandPrefix;
  /**
   * The named prefix for underlying commands if none is specified.
   *
   * @example
   * pls ban @username
   * Where `pls` is the named prefix
   */
  namedPrefix?: string;
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
export function Receiver(reciverOptions: IReceiverOptions): ClassDecorator;
export function Receiver(arg?: string | IReceiverOptions): ClassDecorator {
  return (target: Function) => {
    let options: Partial<IReceiverOptions> = {};

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
