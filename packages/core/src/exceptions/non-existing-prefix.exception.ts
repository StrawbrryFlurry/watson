export class NonExistingPrefixException extends Error {
  constructor(commandName: string) {
    super(
      `Command ${commandName} has no valid prefix set.\n Add a global prefix or specify one in the receiver configuration`
    );
  }
}
