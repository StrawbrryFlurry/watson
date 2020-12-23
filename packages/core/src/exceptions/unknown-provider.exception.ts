import { BootstrappingException } from './bootstrapping.exception';

export class UnknownProviderException extends BootstrappingException {
  constructor(context: string, provider: string, moduleName?: string) {
    if (moduleName) {
      super(
        context,
        `The provider ${provider} is not registered in the module ${moduleName}. Make sure it is either imported or registered as a provider`
      );
    } else {
      super(
        context,
        `The provider ${provider} is not registered in any module. Make sure it is either imported or registered as a provider`
      );
    }
  }
}
