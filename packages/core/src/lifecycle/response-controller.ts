import { EventExecutionContext } from './event-execution-context';

export class ResponseController {
  public apply<CtxResult = any>(ctx: EventExecutionContext, result: CtxResult) {
    // Handle result
    // Pass back data to the client ??
  }
}
