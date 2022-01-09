import { AsyncResolvable, ExceptionHandler, RuntimeException } from '@watsonjs/common';
import { Injectable } from '@watsonjs/di';

@Injectable({ providedIn: "root" })
export class DefaultExceptionHandler implements ExceptionHandler {
  public catch<T extends RuntimeException>(
    exception: T
  ): AsyncResolvable<T | void> {
    throw new Error("Method not implemented.");
  }
}
