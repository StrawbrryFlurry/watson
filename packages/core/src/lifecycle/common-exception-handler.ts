import {
  BadArgumentException,
  CommandContextData,
  EventException,
  EventExceptionHandler,
  UnauthorizedException,
} from '@watsonjs/common';

import { ErrorHost } from '../errors';
import { EventExecutionContext } from './event-execution-context';

export class CommonExceptionHandler extends EventExceptionHandler {
  private errorHost = new ErrorHost();

  constructor() {
    super([BadArgumentException, UnauthorizedException]);
  }

  catch(err: EventException) {
    this.errorHost.handleCommonException(
      err,
      err.context as EventExecutionContext<CommandContextData>
    );
  }
}
