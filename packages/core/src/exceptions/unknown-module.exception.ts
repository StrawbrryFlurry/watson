import { BootstrappingException } from './bootstrapping.exception';

export class UnknownModuleException extends BootstrappingException {
  constructor(context: string) {
    super(
      context,
      `Watson could not resolve a module during the bootstrapping process`
    );
  }
}
