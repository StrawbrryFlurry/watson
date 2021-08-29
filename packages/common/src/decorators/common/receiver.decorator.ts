import { RECEIVER_METADATA } from '@constants';
import { Prefix } from '@interfaces';
import { isNil, isObject, isString } from '@utils';

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
 * @param commandGroup The group all underlying commands will be mapped to.
 * @default commandGroup the name of the receiver without the `Receiver` suffix.
 */
export function Receiver(group?: string): ClassDecorator;
/**
 * Receiver options can be used to apply configuration to the underlying
 * event handlers.
 */
export function Receiver(receiverOptions: ReceiverOptions): ClassDecorator;
export function Receiver(options?: string | ReceiverOptions): ClassDecorator {
  return (target: Function) => {
    let metadata: Partial<ReceiverOptions> = {};
    const groupAlternativeName = target.name.replace("Receiver", "");

    if (isString(options)) {
      metadata["groupName"] = options;
    } else if (isObject(options)) {
      const { groupName } = options;
      metadata = {
        ...options,
        groupName: isNil(groupName) ? groupAlternativeName : groupName,
      };
    } else {
      metadata = {
        groupName: groupAlternativeName,
      };
    }

    Reflect.defineMetadata(RECEIVER_METADATA, metadata, target);
  };
}
