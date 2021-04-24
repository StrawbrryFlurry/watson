import { EventException } from '.';
import { ICommandParameterMetadata } from '../decorators';

export class MissingArgumentException extends EventException {
  constructor(
    public readonly params:
      | ICommandParameterMetadata
      | ICommandParameterMetadata[]
  ) {
    super();
  }
}
