import { EventExecutionException, ExecutionContext } from '@watson/common';

export const rethrowWithContext = (
  err: EventExecutionException,
  ctx: ExecutionContext
) => {
  err.applyContext(ctx);

  throw err;
};
