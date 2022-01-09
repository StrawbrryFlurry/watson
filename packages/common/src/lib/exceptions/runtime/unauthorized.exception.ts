import { RuntimeException } from '../runtime-exception';

export class UnauthorizedException extends RuntimeException {
  constructor(message?: string) {
    super(message);
  }
}
