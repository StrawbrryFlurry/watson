import { BootstrappingException } from './bootstrapping.exception';

export class NonExistingPrefixException extends BootstrappingException {
  constructor(context: string, commandName: string) {
    super(
      context,
      `Command ${commandName} has no valid prefix set.\n Add a global prefix or specify one in the receiver configuration`
    );
  }
}
