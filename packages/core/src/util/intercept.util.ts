export function interceptFn<T, A extends unknown[]>(
  fn: (...args: A) => T,
  interceptor: (...args: A) => unknown
): (...args: A) => T {
  return (...args) => {
    interceptor(...args);
    return fn(...args);
  };
}
