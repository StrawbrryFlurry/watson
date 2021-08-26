import { char } from '@interfaces/command';

export const TRIE_ROOT_NODE = Symbol("TrieRootNode");

export class TrieNode extends Map<char, TrieNode> {
  public isLeaf = false;

  public get word(): string {
    return this._word;
  }
  private _word: string;

  public get parent(): TrieNode | Symbol {
    return this._parent;
  }
  private _parent: TrieNode | Symbol;

  public get parentKey(): char {
    return this._parentKey;
  }
  private _parentKey: char;

  public get isRootNode() {
    return this._isRootNode;
  }
  private _isRootNode: boolean;

  constructor(parent: TrieNode | Symbol, parentKey: char) {
    super();
    this._parent = parent;
    this._parentKey = parentKey;

    if (parent === TRIE_ROOT_NODE) {
      this._word = parentKey;
      this._isRootNode = true;
    } else {
      this._word = (parent as TrieNode).word + parentKey;
      this._isRootNode = false;
    }
  }

  public insert(char: char) {
    const existingNextNode = this.get(char);

    if (existingNextNode) {
      return existingNextNode;
    }

    const next = new TrieNode(this, char);
    this.set(char, next);
    return next;
  }
}
