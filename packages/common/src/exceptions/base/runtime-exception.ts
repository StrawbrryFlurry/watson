import { ExecutionContext } from "@interfaces";

import { WatsonException } from "./watson-exception";

export class RuntimeException extends WatsonException {
  public get context(): ExecutionContext {
    return this._context;
  }
  protected _context: ExecutionContext;

  constructor(message: any, suggestions?: string[]) {
    super(message, suggestions);
  }
}
