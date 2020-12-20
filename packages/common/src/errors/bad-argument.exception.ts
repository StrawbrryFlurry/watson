import { CommandException } from './command.exception';

/**
 * Sends a default message to the channel with information about the correct usage of the command.
 */
export class BadArgumentException extends CommandException {
  constructor(commandCtx: unknown) {
    super(commandCtx as string);
  }
}
