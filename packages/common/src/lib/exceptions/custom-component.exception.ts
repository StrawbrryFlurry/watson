import { RuntimeException } from './runtime-exception';

export class CustomComponentException extends RuntimeException {
  constructor(message: string) {
    super(message);
  }
}
