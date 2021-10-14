import { RECEIVER_METADATA } from '@constants';
import { CustomProvider, Prefix, Type } from '@interfaces';
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
  /**
   * Providers that are scoped to this
   * receiver.
   */
  providers?: (CustomProvider | Type)[];
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
    const groupAlternativeName = target.name.replace("Receiver", "");

    const apply = (metadata: ReceiverOptions) =>
      Reflect.defineMetadata(RECEIVER_METADATA, metadata, target);

    if (isString(options)) {
      const metadata: Partial<ReceiverOptions> = {
        groupName: options,
      };

      return apply(metadata);
    }

    if (isObject(options)) {
      const { groupName } = options;
      const metadata: Partial<ReceiverOptions> = {
        ...options,
        groupName: isNil(groupName) ? groupAlternativeName : groupName,
      };

      return apply(metadata);
    }

    apply({
      groupName: groupAlternativeName,
    });
  };
}
