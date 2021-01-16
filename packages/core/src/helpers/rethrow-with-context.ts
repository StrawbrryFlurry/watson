import { EventException, ExecutionContext } from '@watson/common';

export const rethrowWithContext = (
  err: EventException,
  ctx: ExecutionContext
) => {
  err.applyContext(ctx);

  throw err;
};
