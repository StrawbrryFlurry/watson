import { BadArgumentException, EventException, EventExceptionHandler, UnauthorizedException } from '@watsonjs/common';

import { CommandPipelineHost } from '../command';
import { ErrorHost } from '../errors';
import { ExecutionContextHost } from './execution-context-host';

export class CommonExceptionHandler extends EventExceptionHandler {
  private errorHost = new ErrorHost();

  constructor() {
    super([BadArgumentException, UnauthorizedException]);
  }

  catch(err: EventException) {
    this.errorHost.handleCommonException(
      err,
      err.context as ExecutionContextHost<CommandPipelineHost>
    );
  }
}
