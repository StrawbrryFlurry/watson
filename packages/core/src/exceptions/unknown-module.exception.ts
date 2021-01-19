import { BootstrappingException } from './bootstrapping.exception';

const UNKNOWN_MODULE_SUGGESTIONS = [
  "Refer to the docs on how to configure your module",
];

export class UnknownModuleException extends BootstrappingException {
  constructor(context: string) {
    super(
      context,
      `Watson could not resolve a module during the bootstrapping process`,
      UNKNOWN_MODULE_SUGGESTIONS
    );
  }
}
