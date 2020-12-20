import { isObject, isString } from 'class-validator';

import { RECEIVER_OPTIONS_METADATA } from '../../constants';

export interface IReceiverCommandOptions {
  casesensitive?: boolean;
}

/**
 * @property command The name of the command
 * @property channel An array that contains either the ChannelID, the ChannelName or a regular expression that matches the Channel Name
 */
export interface IReceiverOptions {
  command: string;
  commandOptions?: IReceiverCommandOptions;
  prefix?: string;
}

/**
 * @param command The name of the command
 * @param commandOptions Configurable options for the underlying commands
 */
export function Receiver(): ClassDecorator;
export function Receiver(command?: string): ClassDecorator;
export function Receiver(reciverOptions: IReceiverOptions): ClassDecorator;
export function Receiver(arg?: string | IReceiverOptions): ClassDecorator {
  let options: Partial<IReceiverOptions> = {};
  if (isString(arg)) {
    options["command"] = arg;
  } else if (isObject(arg)) {
    options = arg;
  }

  return (target: Object) => {
    Reflect.defineMetadata(RECEIVER_OPTIONS_METADATA, options, target);
  };
}
