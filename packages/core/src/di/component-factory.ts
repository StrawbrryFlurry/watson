import { Binding, Injector } from '@di';
import { Type } from '@watsonjs/common';

/**
 * Helper class for creating instances
 * of module components like `Receivers`,
 * `Injectables` or the Module type
 * itself.
 */
export class ComponentFactory {
  private _injector: Injector;

  constructor(/** The module injector */ injector: Injector) {
    this._injector = injector;
  }

  /**
   * Creates a new instance of `componentType`.
   *
   * @param componentType The Component to instanciate
   * @param injector Optional injector for resolving component deps
   */
  public create(componentType: Type, injector?: Injector): Binding {
    return 0 as any;
  }
}
