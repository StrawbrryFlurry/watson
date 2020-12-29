import { RuntimeException } from './runtime-exception';

export class AsyncResolutionException extends RuntimeException {
  constructor(message: string) {
    super(message);
  }
}
