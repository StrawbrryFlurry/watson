import { ExecutionContext } from '../interfaces';

export class CommandException extends Error {
  private commandCtx: ExecutionContext<any>;

  constructor(message?: string) {
    super(message);
  }

  public setContext(context: ExecutionContext<any>) {
    this.commandCtx = context;
  }

  public getContext() {
    return this.commandCtx;
  }
}
