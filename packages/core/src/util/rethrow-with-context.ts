import { ExecutionContext } from '@watsonjs/common';

export const rethrowWithContext = (err: any, ctx: ExecutionContext) => {
  err.applyContext(ctx);

  throw err;
};
