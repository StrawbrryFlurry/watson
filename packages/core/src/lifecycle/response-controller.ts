import { ExecutionContext } from '@watsonjs/common';

export class ResponseController {
  public apply<CtxResult = any>(ctx: ExecutionContext, result: CtxResult) {
    // Handle result
    // Pass back data to the client ??
  }
}
