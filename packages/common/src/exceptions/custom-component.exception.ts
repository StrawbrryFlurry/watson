import { RuntimeException } from '@common/exceptions';

export class CustomComponentException extends RuntimeException {
  constructor(message: string) {
    super(message);
  }
}
