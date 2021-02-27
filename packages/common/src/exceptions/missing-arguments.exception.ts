import { EventException } from '.';
import { ICommandParam } from '../decorators';

export class MissingArgumentException extends EventException {
  constructor(params: ICommandParam | ICommandParam[]) {
    super();
  }
}
