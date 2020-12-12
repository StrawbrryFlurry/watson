export class UnknownModuleException extends Error {
  constructor() {
    super(`Watson could not resolve a module during the bootstrapping process`);
  }
}
