import {
  BadArgumentException,
  EventException,
  EventExceptionHandler,
  MissingArgumentException,
  UnauthorizedException,
} from '@watsonjs/common';

import { CommandPipelineHost } from '../command';
import { ErrorHost } from '../errors';
import { ExecutionContextHost } from './execution-context';

export class CommonExceptionHandler extends EventExceptionHandler {
  private errorHost = new ErrorHost();

  constructor() {
    super([
      BadArgumentException,
      UnauthorizedException,
      MissingArgumentException,
    ]);
  }

  catch(err: EventException) {
    this.errorHost.handleCommonException(
      err,
      err.context as ExecutionContextHost<CommandPipelineHost>
    );
  }
}
