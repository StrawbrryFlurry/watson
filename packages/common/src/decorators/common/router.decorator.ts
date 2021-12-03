import { Prefix } from '@common/command/common';
import { MatchingStrategy } from '@common/command/matcher';
import { ROUTER_METADATA } from '@common/constants';
import { CustomProvider } from '@common/di';
import { Type } from '@common/type';
import { isNil, isObject, isString } from '@common/utils';

export interface RouterDecoratorOptions {
  /**
   * The command group underlying commands will be mapped to.
   *
   * @example
   * `Help`
   */
  group?: string;
  /**
   * Providers that are scoped to this
   * router.
   */
  providers?: (CustomProvider | Type)[];
  /** Prefixes that will be mapped within this router */
  prefixes?: Prefix[];
  /** The matching strategy used for commands in this router */
  matchingStrategy?: MatchingStrategy;
}

/**
 * Router options can be used to apply configuration to the underlying
 * event handlers.
 */
export function Router(routerOptions: RouterDecoratorOptions): ClassDecorator;
export function Router(
  options?: string | RouterDecoratorOptions
): ClassDecorator {
  return (target: Function) => {
    const groupAlternativeName = target.name.replace("Router", "");

    const apply = (metadata: RouterDecoratorOptions) =>
      Reflect.defineMetadata(ROUTER_METADATA, metadata, target);

    if (isString(options)) {
      const metadata: Partial<RouterDecoratorOptions> = {
        group: options,
      };

      return apply(metadata);
    }

    if (isObject(options)) {
      const { group } = options;
      const metadata: Partial<RouterDecoratorOptions> = {
        ...options,
        group: isNil(group) ? groupAlternativeName : group,
      };

      return apply(metadata);
    }

    apply({
      group: groupAlternativeName,
    });
  };
}
