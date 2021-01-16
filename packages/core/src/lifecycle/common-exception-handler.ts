import { BadArgumentException, EventException, EventExceptionHandler, UnatuhorizedException } from '@watson/common';
import { ErrorHost } from 'errors';

export class CommonExceptionHandler extends EventExceptionHandler<any> {
  private errorHost = new ErrorHost();

  constructor() {
    super([BadArgumentException, UnatuhorizedException]);
  }

  catch(err: EventException) {
    this.errorHost.handleCommonException(err, err.context);
  }
}
