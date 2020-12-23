export class BootstrappingException extends Error {
  private context: string;

  constructor(context: string, message: string) {
    super(message);

    this.context = context;
  }

  public getContext() {
    return this.context;
  }

  public getMessage() {
    return this.message;
  }

  public getStack() {
    return this.stack;
  }
}
