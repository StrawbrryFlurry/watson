import { isEmpty, isNil } from '@watsonjs/common';

export abstract class WatsonException extends Error {
  public readonly suggestions: string[];

  constructor(message: string, suggestions?: string[]) {
    super(message);

    this.suggestions = suggestions;
  }

  public getMessage() {
    return this.message;
  }

  public getStack() {
    return this.stack;
  }

  public hasSuggestions() {
    return !isNil(this.suggestions) && !isEmpty(this.suggestions);
  }
}
