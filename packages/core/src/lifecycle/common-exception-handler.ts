import { ErrorHost } from '@core/errors';
import { BadArgumentException, ExecutionContext, MissingArgumentException, UnauthorizedException } from '@watsonjs/common';

import { ExceptionHandlerImpl } from '../lifecycle/exception-handler';

export class CommonExceptionHandler extends ExceptionHandlerImpl {
  private errorHost = new ErrorHost();

  constructor() {
    super([
      BadArgumentException as any,
      UnauthorizedException as any,
      MissingArgumentException as any,
    ]);
  }

  catch(err: Error) {
    this.errorHost.handleCommonException(
      err as any,
      (err as any).context as ExecutionContext
    );
  }
}
