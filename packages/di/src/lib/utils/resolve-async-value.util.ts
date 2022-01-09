import { Observable } from "rxjs";

export type AsyncType<T = any> = T | Observable<T> | Promise<T> | AsyncType[];

type AsyncResolutionType<T extends AsyncType> = T extends Observable<infer R>
  ? R
  : T extends Promise<infer R>
  ? R
  : T extends AsyncType<infer R>[]
  ? R
  : T extends T
  ? T
  : never;

/**
 * Resolves asynchronous data to a single promise whose value can be awaited.
 */
export async function resolveAsyncValue<
  R extends AsyncResolutionType<T>,
  T extends AsyncType = any
>(v: T): Promise<R> {
  if (v instanceof Promise) {
    return v;
  } else if (v instanceof Observable) {
    return v.toPromise();
  } else if (Array.isArray(v)) {
    return Promise.all(
      v.map((asyncValue) => resolveAsyncValue(asyncValue))
    ) as any;
  } else {
    return v as R;
  }
}
