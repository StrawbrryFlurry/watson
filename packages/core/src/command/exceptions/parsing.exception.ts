import { RuntimeException } from '@watsonjs/common';

export class ParsingException extends RuntimeException {
  constructor(message: string) {
    super(message);
  }
}
