import { Prefix } from '@interfaces/command';

/**
 * Holds a map of value - prefix pairs.
 *
 * Use this type to reference the current
 * cache in DI.
 */
export abstract class PrefixCache<K = any, V = any> extends Map<K, V> {
  protected toNormalizedPrefix(prefixRef: Prefix): string {
    const { prefix } = prefixRef;
    return prefix?.trim()?.toLowerCase();
  }
}
