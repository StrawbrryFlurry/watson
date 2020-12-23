import { BootstrappingException } from './bootstrapping.exception';

export class CommandConfigurationException extends BootstrappingException {
  constructor(context: string, message: string) {
    super(context, message);
  }
}
