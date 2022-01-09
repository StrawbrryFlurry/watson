import { WatsonException } from '@watsonjs/common';

export class BootstrapException extends WatsonException {
  constructor(public context: string, message: string, suggestions?: string[]) {
    super(message, suggestions);
  }
}
