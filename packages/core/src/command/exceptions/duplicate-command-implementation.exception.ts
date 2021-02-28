import { BootstrappingException } from '../../exceptions';
import { DUPLICATE_COMMAND_NAME } from '../../logger';
import { CommandRouteHost } from '../../router';

export class DuplicateCommandImplementationException extends BootstrappingException {
  constructor(
    existing: CommandRouteHost,
    duplicate: CommandRouteHost,
    conflict: string
  ) {
    super(
      "CommandContainer",
      DUPLICATE_COMMAND_NAME(
        conflict,
        duplicate.prefix,
        existing.host,
        duplicate.host
      )
    );
  }
}
