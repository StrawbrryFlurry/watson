import { WatsonException } from './watson-exception';

export class RuntimeException extends WatsonException {
  constructor(message: string, suggestions?: string[]) {
    super(message, suggestions);
  }
}
