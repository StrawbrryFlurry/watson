import { COMPONENT_METADATA } from "@di/constants";
import { CustomProvider } from "@di/providers";
import { Type } from "@di/types";

export interface ComponentDecoratorOptions {
  /**
   * Providers that are scoped to this
   * router.
   */
  providers?: (CustomProvider | Type)[];
}

export function WatsonComponent(
  options: ComponentDecoratorOptions
): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(COMPONENT_METADATA, target, options);
  };
}
