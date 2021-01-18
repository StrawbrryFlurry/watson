import { Observable } from 'rxjs';

export type IAsyncType<T = any> = Observable<T> | Promise<T> | IAsyncType[];

/**
 * Resolves asynchronous data to a single promise whose value can be awaited.
 */
export class AsyncContextResolver {
  public async resolveAsyncValue<T = any, R = any>(
    result: IAsyncType<T> | T
  ): Promise<R | T> {
    if (result instanceof Promise) {
      return await this.resolveFromPromise(result);
    } else if (result instanceof Observable) {
      return await this.resolveFromObservable(result);
    } else if (Array.isArray(result)) {
      return (await this.resolveAsyncArray(result)) as any;
    } else {
      return result;
    }
  }

  private async resolveFromPromise<T = any>(promise: Promise<T>) {
    return await this.resolveAsyncValue(await promise);
  }

  private async resolveFromObservable<T = any>(observable: Observable<T>) {
    const asPromise = observable.toPromise();
    return await this.resolveAsyncValue(asPromise);
  }

  private async resolveAsyncArray<T extends IAsyncType>(arr: T[]) {
    return Promise.all(
      arr.map((asyncValue) => this.resolveAsyncValue(asyncValue))
    );
  }
}
