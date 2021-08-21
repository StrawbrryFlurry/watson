import { isEmpty, isNil } from '../../utils';

export abstract class WatsonException extends Error {
  public readonly suggestions: string[] | undefined;

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
