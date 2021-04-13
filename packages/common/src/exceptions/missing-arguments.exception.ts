import { EventException } from '.';
import { ICommandParam } from '../decorators';

export class MissingArgumentException extends EventException {
  constructor(public readonly params: ICommandParam | ICommandParam[]) {
    super();
  }
}
