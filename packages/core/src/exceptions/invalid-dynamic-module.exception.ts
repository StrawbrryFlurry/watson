import { BootstrappingException } from './bootstrapping.exception';

export class InvalidDynamicModuleException extends BootstrappingException {
  constructor(ctx: string, message: string) {
    super(ctx, message);
  }
}
