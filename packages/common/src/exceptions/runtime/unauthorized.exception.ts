import { RuntimeException } from '@exceptions';

export class UnauthorizedException extends RuntimeException {
  constructor(message?: string) {
    super(message);
  }
}
