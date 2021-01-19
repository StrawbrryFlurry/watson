import { CommandException } from './command.exception';

export class UnatuhorizedException extends CommandException {
  constructor(message?: string) {
    super(message);
  }
}
