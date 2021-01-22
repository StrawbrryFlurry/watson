import { EventException } from './event.exception';

export class UnauthorizedException extends EventException {
  constructor(message?: string) {
    super(message);
  }
}
