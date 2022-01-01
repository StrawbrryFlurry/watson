import { COMPONENT_METADATA } from '@di/constants';
import { CustomProvider } from '@di/providers/custom-provider.interface';
import { Type } from '@di/types';

export interface ComponentDecoratorOptions {
  /**
   * Providers that are scoped to this
   * router.
   */
  providers?: (CustomProvider | Type)[];
}

/**
 * Decorator that marks a class as a component.
 */
export function WatsonComponent(
  options: ComponentDecoratorOptions = {}
): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(COMPONENT_METADATA, target, options);
  };
}
