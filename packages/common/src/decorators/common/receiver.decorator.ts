import { RECEIVER_OPTIONS_METADATA } from '../../constants';
import { isUndefined } from '../../utils';

export interface IReceiverCommandOptions {
  casesensitive?: boolean;
}

/**
 * @property command The name of the command
 * @property channel An array that contains either the ChannelID, the ChannelName or a regular expression that matches the Channel Name
 */
export interface IReceiverOptions {
  command: string;
  channel: string[];
  commandOptions?: IReceiverCommandOptions;
  prefix?: string;
}

/**
 * @param command The name of the command
 * @param commandOptions Configurable options for the underlying commands
 */
export function Receiver(): ClassDecorator;
export function Receiver(command?: string): ClassDecorator;
export function Receiver(
  command?: string,
  reciverOptions?: IReceiverOptions
): ClassDecorator {
  const options = isUndefined(reciverOptions) ? {} : reciverOptions;
  options["command"] = isUndefined(command)
    ? isUndefined(reciverOptions?.command)
      ? undefined
      : reciverOptions!.command
    : command;

  return (target: Object) => {
    Reflect.defineMetadata(RECEIVER_OPTIONS_METADATA, options, target);
  };
}
