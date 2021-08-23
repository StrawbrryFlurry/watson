import { Prefix, PrefixCache } from '@watsonjs/common';

export class StaticPrefixCache extends PrefixCache<string, Prefix> {
  public prefixes: string[] = [];

  constructor(prefixes: Prefix[]) {
    super();

    for (let i = 0; i < prefixes.length; i++) {
      const prefixRef = prefixes[i];
      this._applyPrefix(prefixRef);
    }
  }

  private _applyPrefix(prefix: Prefix) {
    const normalizedPrefix = this.toNormalizedPrefix(prefix);
    this.set(normalizedPrefix, prefix);

    /**
     * We could work with a set here
     * but this process only happens once
     * while the cache is initialized.
     *
     * Arrays provide faster iteration
     * to using `Symbol.Iterator` with
     * sets which we'll be doing at runtime
     */
    if (this.prefixes.indexOf(normalizedPrefix) === -1) {
      this.prefixes.push(normalizedPrefix);
    }
  }
}
