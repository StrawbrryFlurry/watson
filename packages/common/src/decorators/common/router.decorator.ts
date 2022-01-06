import { Prefix } from '@common/command/common';
import { MatchingStrategy } from '@common/command/matcher';
import { isNil, isObject, isString } from '@common/utils';
import { ComponentDecoratorOptions, WatsonComponent } from '@watsonjs/di';

export interface RouterDecoratorOptions extends ComponentDecoratorOptions {
  /**
   * The command group underlying commands will be mapped to.
   *
   * @example
   * `Help`
   */
  group?: string;
  /** Prefixes that will be mapped within this router */
  prefixes?: Prefix[];
  /** The matching strategy used for commands in this router */
  matchingStrategy?: MatchingStrategy;
}

/**
 * Router options can be used to apply configuration to the underlying
 * event handlers.
 */
export function Router(routerOptions?: RouterDecoratorOptions): ClassDecorator;
export function Router(
  options?: string | RouterDecoratorOptions
): ClassDecorator {
  return (target: Function): void => {
    const groupAlternativeName = target.name.replace("Router", "");

    const apply = (metadata: RouterDecoratorOptions) =>
      WatsonComponent(metadata)(target);

    if (isString(options)) {
      const metadata: Partial<RouterDecoratorOptions> = {
        group: options,
      };

      return void apply(metadata);
    }

    if (isObject(options)) {
      const { group } = options;
      const metadata: Partial<RouterDecoratorOptions> = {
        ...options,
        group: isNil(group) ? groupAlternativeName : group,
      };

      return void apply(metadata);
    }

    apply({
      group: groupAlternativeName,
    });
  };
}
