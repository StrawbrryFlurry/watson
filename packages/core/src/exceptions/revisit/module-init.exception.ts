import { BootstrappingException } from './bootstrapping.exception';

export class ModuleInitException extends BootstrappingException {
  constructor(message: string) {
    super("ModuleInit", message);
  }
}
