import { WatsonException } from '@watsonjs/common';

export class BootstrappingException extends WatsonException {
  private context: string;

  constructor(context: string, message: string, suggestions?: string[]) {
    super(message, suggestions);

    this.context = context;
  }

  public getContext() {
    return this.context;
  }
}
