import { isNil } from '@common/utils';

import { TRIE_ROOT_NODE, TrieNode } from './trie-node';

export class Trie {
  private _node: TrieNode = new TrieNode(TRIE_ROOT_NODE, "");

  public contains(word: string): boolean {
    let node = this._node;
    word = this.normalizeInput(word);

    for (let i = 0; i < word.length; i++) {
      let char = word[i];
      const nextNode = node.get(char);

      if (isNil(nextNode)) {
        return false;
      }

      if (nextNode.isLeaf) {
        return true;
      }

      node = nextNode;
    }

    return false;
  }

  public find(word: string, best: boolean = false) {
    let node = this._node;
    word = this.normalizeInput(word);
    let lastLeafMatch: TrieNode | null = null;

    for (let i = 0; i < word.length; i++) {
      let char = word[i];
      const nextNode = node.get(char);

      if (isNil(nextNode)) {
        return lastLeafMatch;
      }

      if (!nextNode.isLeaf) {
        node = nextNode;
        continue;
      }

      if (!best) {
        return nextNode;
      }

      if (nextNode.size === 0) {
        return nextNode;
      }

      lastLeafMatch = nextNode;
      node = nextNode;
    }

    return null;
  }

  public addPrefix(prefix: string) {
    prefix = this.normalizeInput(prefix);
    let node = this._node;

    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      node = node.insert(char);
    }
    node.isLeaf = true;
  }

  public normalizeInput(str: string): string {
    return str.trim().toLowerCase();
  }
}
