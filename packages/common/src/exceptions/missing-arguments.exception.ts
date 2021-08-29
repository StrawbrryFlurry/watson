import { CommandParameterOptions } from '@decorators';
import { RuntimeException } from '@exceptions';

export class MissingArgumentException extends RuntimeException {
  constructor(
    public readonly params: CommandParameterOptions | CommandParameterOptions[]
  ) {
    super(params);
  }
}
