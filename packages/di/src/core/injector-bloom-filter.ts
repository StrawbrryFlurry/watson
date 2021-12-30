import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

// TODO:
// Does this significantly improve
// lookup performance or slow it
// down in the majority of cases.

const BLOOM_BUCKET_SIZE = 256;
const BLOOM_MASK = BLOOM_BUCKET_SIZE - 1;

/**
 * Why is this the only global
 * mutable property?
 *
 * The element ID on a type is
 * defined on it's prototype
 * which makes it unrestricted.
 */
let W_ELEMENT_ID = 1;

/**
 * @private
 */
export class InjectorBloomFilter {
  /**
   * The buckets are 8 bit vectors
   * with a size of 32 bits each.
   *
   * This is inspired by the
   * bloom filter implementation
   * used in Angular.
   *
   *                 0                 ..                 8
   *  00000000000000000000000000000000 .. 00000000000000000000000000000000
   *  \____________32 bits___________/    \____________32 bits___________/
   *
   * {@link [Ivy Node Injector](https://indepth.dev/posts/1268/angular-di-getting-to-know-the-ivy-nodeinjector)}
   */
  private _buckets: number[];

  constructor() {}

  public has(hash: number): boolean {
    const mask = 1 << hash;
    const buckedIdx = ~~(hash / 32);
    const bucketVector = this._buckets[buckedIdx];

    return !!(bucketVector & mask);
  }

  public add(type: any | Type): void {
    const id: number = isNil(type[W_ELEMENT_ID])
      ? (type[W_ELEMENT_ID] = 1) // TODO: )
      : type[W_ELEMENT_ID];

    const bloomBit = id & BLOOM_MASK;
    const mask = 1 << bloomBit;

    const buckedIdx = ~~(bloomBit / 32);
    this._buckets[buckedIdx] |= mask;
  }

  /**
   * Returns the hash code of a given
   * provider element id.
   *
   * If the provider requires a context
   * injector `null` is returned.
   */
  public getHash(type: any | Type): number | null {
    const id = type[W_ELEMENT_ID];

    if (id === -1) {
      return null;
    }

    return id & BLOOM_MASK;
  }
}
