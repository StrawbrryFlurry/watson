/**
 * Usually, we use sets when it comes to
 * making sure our set of elements is unique.
 *
 * Sets have a minor drawback in that the iterator
 * is a little bit slower than using regular `for`
 * iteration.
 *
 * In case you need regular array indexing whilst
 * still making sure that the elements in the array
 * are unique, use this Array implementation.
 *
 * NOTE:
 * This implementation doesn't do a weak comparison
 * and checks for strict object references.
 *
 * - `{} !== {}`
 * - `SomeClass !== SomeOtherClass`
 * - `SomeClass === SomeClass`
 */
export class UniqueTypeArray<T> extends Array<T> {
  constructor() {
    super();
    this._push = super.push;
    this.push = this.add;
  }

  public has(element: T): boolean {
    return this.indexOf(element) !== -1;
  }

  public add(...elements: T[]): number {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      if (this.has(element)) {
        continue;
      }

      this._push(element);
    }

    return this.length;
  }

  private _push: Array<T>["push"];
}
