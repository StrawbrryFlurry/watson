import { RuntimeException } from '@common/exceptions';

export class UnauthorizedException extends RuntimeException {
  constructor(message?: string) {
    super(message);
  }
}
