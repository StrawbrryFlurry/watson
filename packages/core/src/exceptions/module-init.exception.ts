import { WatsonException } from '@watsonjs/common/exceptions/watson-exception';

export class ModuleInitException extends WatsonException {
  constructor(message: string) {
    super(message);
  }
}
