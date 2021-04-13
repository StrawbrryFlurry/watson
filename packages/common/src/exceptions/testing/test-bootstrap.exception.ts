import { WatsonException } from '../watson-exception';

export class TestBootstrapException extends WatsonException {
  constructor(message: string) {
    super(message);
  }
}
