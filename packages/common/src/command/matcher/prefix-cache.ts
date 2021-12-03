/**
 * Holds a map of value - prefix pairs.
 *
 * Use this type to reference the current
 * cache in DI.
 */
export abstract class PrefixCache<K = any, V = any> extends Map<K, V> {
  protected toNormalizedPrefix(prefix: string): string {
    return prefix.trim().toLowerCase();
  }
}
