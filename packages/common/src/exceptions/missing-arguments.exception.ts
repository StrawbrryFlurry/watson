import { CommandParameterOptions } from '@common/decorators';

import { RuntimeException } from './runtime-exception';

export class MissingArgumentException extends RuntimeException {
  constructor(
    public readonly params: CommandParameterOptions | CommandParameterOptions[]
  ) {
    super(params);
  }
}
