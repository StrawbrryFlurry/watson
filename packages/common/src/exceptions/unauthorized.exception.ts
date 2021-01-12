import { ExecutionContext } from 'interfaces';

import { CommandException } from './command.exception';

export class UnatuhorizedException extends CommandException {
  constructor(ctx: ExecutionContext) {
    super();
  }
}
