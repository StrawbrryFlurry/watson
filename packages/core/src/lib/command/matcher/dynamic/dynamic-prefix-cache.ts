import { Prefix, PrefixCache, Trie } from '@watsonjs/common';

export class DynamicPrefixCache extends PrefixCache<string, Prefix> {
  private _trie = new Trie();
}
