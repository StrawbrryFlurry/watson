import { CommandParameterOptions } from '@decorators/common';
import { RuntimeException } from '@exceptions';

export class MissingArgumentException extends RuntimeException {
  constructor(
    public readonly params: CommandParameterOptions | CommandParameterOptions[]
  ) {
    super(params);
  }
}
