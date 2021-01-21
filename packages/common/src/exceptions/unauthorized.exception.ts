import { EventException } from './event.exception';

export class UnatuhorizedException extends EventException {
  constructor(message?: string) {
    super(message);
  }
}
