import { Observable } from 'rxjs';

export type IAsyncType<T = any> = Observable<T> | Promise<T> | IAsyncType[];

/**
 * Resolves asynchronous data to a single promise whose value can be awaited.
 */
export async function resolveAsyncValue<R = any, T = any>(
  result: IAsyncType<T> | T
): Promise<R | T> {
  if (result instanceof Promise) {
    return await resolveFromPromise(result);
  } else if (result instanceof Observable) {
    return await resolveFromObservable(result);
  } else if (Array.isArray(result)) {
    return ((await resolveAsyncArray(result)) as unknown) as R;
  } else {
    return result;
  }
}

async function resolveFromPromise<T = any>(promise: Promise<T>) {
  return await resolveAsyncValue(await promise);
}

async function resolveFromObservable<T = any>(observable: Observable<T>) {
  const asPromise = observable.toPromise();
  return await resolveAsyncValue(asPromise);
}

async function resolveAsyncArray<T extends IAsyncType>(arr: T[]) {
  return Promise.all(arr.map((asyncValue) => resolveAsyncValue(asyncValue)));
}
