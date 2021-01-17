import { EventException } from './event.exception';

export class CustomComponentException extends EventException {
  constructor(message: string) {
    super(message);
  }
}
