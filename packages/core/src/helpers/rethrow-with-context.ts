import { EventException, ExecutionContext } from '@watsonjs/common';

export const rethrowWithContext = (
  err: EventException,
  ctx: ExecutionContext
) => {
  err.applyContext(ctx);

  throw err;
};
