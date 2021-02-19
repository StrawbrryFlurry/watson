import { BootstrappingException } from '../../exceptions';
import { DUPLICATE_COMMAND_NAME } from '../../logger';
import { CommandRoute } from '../../routes';

export class DuplicateCommandImplementationException extends BootstrappingException {
  constructor(
    existing: CommandRoute,
    duplicate: CommandRoute,
    conflict: string
  ) {
    super(
      "CommandContainer",
      DUPLICATE_COMMAND_NAME(
        conflict,
        duplicate.prefix.getFirst(),
        existing.host,
        duplicate.host
      )
    );
  }
}
