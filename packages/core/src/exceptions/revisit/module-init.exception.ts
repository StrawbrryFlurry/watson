export class ModuleInitException extends Error {
  constructor(message: string) {
    super("ModuleInit" + message);
  }
}
