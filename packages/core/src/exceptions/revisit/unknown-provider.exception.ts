const UNKNOWN_PROVIDER_SUGGESTIONS = [
  "Make sure it is either imported or registered as a provider.",
  "If you imported a global module, make sure the host module is declared as such.",
];

export class UnknownProviderException extends Error {
  constructor(context: string, provider: string, moduleName?: string) {
    if (moduleName) {
      super(
        context +
          `The provider ${provider} is not registered in the module ${moduleName}. ` +
          UNKNOWN_PROVIDER_SUGGESTIONS
      );
    } else {
      super(
        context +
          `The provider ${provider} is not registered in any module.` +
          UNKNOWN_PROVIDER_SUGGESTIONS
      );
    }
  }
}
