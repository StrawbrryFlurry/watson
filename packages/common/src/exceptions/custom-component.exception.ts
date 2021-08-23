import { RuntimeException } from '@exceptions';

export class CustomComponentException extends RuntimeException {
  constructor(message: string) {
    super(message);
  }
}
