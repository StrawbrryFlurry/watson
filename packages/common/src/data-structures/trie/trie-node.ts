import { char } from '@interfaces/command';

export class TrieNode {
  next: TrieNode;
  value: char | null;
}
