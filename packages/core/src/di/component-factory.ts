import { Binding, ContextInjector, Injector } from '@di';
import { DIProvided, Type } from '@watsonjs/common';

/**
 * Helper class for creating instances
 * of module components like `Receivers`,
 * `Injectables` or the Module type
 * itself.
 */
export class ComponentFactory extends DIProvided({ providedIn: "module" }) {
  private _injector: Injector;

  constructor(/** The module injector */ injector: Injector) {
    super();
    this._injector = injector;
  }

  /**
   * Creates a new instance of `componentType`.
   *
   * @param componentType The Component to instanciate
   * @param context Optional {@link ContextInjector} for resolving component deps
   */
  public create(componentType: Type, context?: ContextInjector): Binding {
    return 0 as any;
  }
}
