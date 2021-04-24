import { BootstrappingException } from './bootstrapping.exception';

const UNKNOWN_INJECTABLE_SUGGESTIONS = [
  "Make sure it is either imported or registered as an injectable.",
];

export class UnknownInjectableException extends BootstrappingException {
  constructor(context: string, injectable: string, moduleName: string) {
    super(
      context,
      `The injectable ${injectable} was not found in ${moduleName}.`,
      UNKNOWN_INJECTABLE_SUGGESTIONS
    );
  }
}
