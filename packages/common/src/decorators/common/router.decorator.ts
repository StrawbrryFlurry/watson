import { MatchingStrategy, Prefix } from '@common/interfaces';

export interface RouterDecoratorOptions {
  prefixes?: Prefix[];
  group?: string;
  matchingStrategy?: MatchingStrategy;
}

// TODO: Receiver -> Router
export function Router(options: RouterDecoratorOptions) {}
