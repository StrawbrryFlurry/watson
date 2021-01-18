import { EventException } from '@watsonjs/common';

import { EventExecutionContext } from '../lifecycle';

export const rethrowWithContext = (
  err: EventException,
  ctx: EventExecutionContext
) => {
  err.applyContext(ctx);

  throw err;
};
