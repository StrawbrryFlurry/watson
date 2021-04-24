import { BootstrappingException } from './bootstrapping.exception';

const COMMAND_CONFIGURATION_SUGGESTIONS = [
  "Refer to the docs for valid configuration.",
];

export class CommandConfigurationException extends BootstrappingException {
  constructor(context: string, message: string) {
    super(context, message);
  }
}
