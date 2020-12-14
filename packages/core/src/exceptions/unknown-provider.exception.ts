export class UnknownProviderException extends Error {
  constructor(provider: string, moduleName?: string) {
    if (moduleName) {
      super(
        `The provider ${provider} is not registered in the module ${moduleName}. Make sure it is either imported or registered as a provider`
      );
    } else {
      super(
        `The provider ${provider} is not registered in any module. Make sure it is either imported or registered as a provider`
      );
    }
  }
}
