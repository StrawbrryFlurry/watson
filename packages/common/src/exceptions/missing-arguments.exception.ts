import { ICommandParam } from "decorators";

import { EventException } from ".";

export class MissingArgumentException extends EventException {
  constructor(public readonly params: ICommandParam | ICommandParam[]) {
    super();
  }
}
