import { AsyncContextResolver } from './async-context-resolver';

export type ICommandResponse<T = any> = undefined | T[] | T;

export class ResponseParser {
  private asyncResolver = new AsyncContextResolver();

  public async parse(commandData: ICommandResponse) {
    if (typeof commandData === "undefined") {
      return;
    }

    return this.asyncResolver.resolveAsyncValue(commandData);
  }
}
