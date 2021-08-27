import { ReceiverDef } from '@watsonjs/common';
import { blue, cyan, green, red } from 'cli-color';

import { InstanceWrapper } from '../injector';

export const BOOTSTRAPPING_ERROR_MESSAGE = () =>
  red("An error occured during the bootstrapping process.");

export const SUGGESTION = (s: string) => "Possible fix: " + green(s);

export const EXCEPTION_STACK = (s: string) => red(s);

export const DUPLICATE_COMMAND_NAME = (
  conflict: string,
  prefix: string,
  existing: InstanceWrapper<ReceiverDef>,
  duplicate: InstanceWrapper<ReceiverDef>
) =>
  `The command with name ${cyan(`${prefix}${conflict}`)} in receiver ${blue(
    duplicate.name
  )} cannot be added to the application as it already exists in receiver ${blue(
    existing.name
  )}`;
