export class InvalidDynamicModuleException extends Error {
  constructor(ctx: string, message: string) {
    super(ctx + message);
  }
}
