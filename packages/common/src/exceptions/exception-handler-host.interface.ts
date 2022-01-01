import { AsyncResolvable, ResolvedAsyncValue } from '@watsonjs/common';

import { RuntimeException } from './runtime-exception';

export interface ExceptionHandlerHost {
  handle(exception: RuntimeException | Error): Promise<void>;
  run<T extends AsyncResolvable<void>, R extends ResolvedAsyncValue<T>>(
    cb: () => T
  ): Promise<R | null>;
}
