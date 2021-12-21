import { ContextInjector } from '@core/di';
import { RouterRef } from '@core/router';
import { Injectable, Injector, NOT_FOUND, Type } from '@watsonjs/di';

/**
 * Helper class for creating instances
 * of module components like `Routers`,
 * `Injectables` or the Module type
 * itself.
 */
@Injectable({ providedIn: "module" })
export class ComponentFactory {
  /**
   * Creates a new instance of `componentType`.
   *
   * @param componentType The Component to instantiate
   * @param context Optional {@link ContextInjector} for resolving component deps
   */
  public async create(
    componentType: Type,
    moduleInjector: Injector,
    ctx?: ContextInjector
  ) {
    const componentRef = (await moduleInjector.get(
      componentType,
      NOT_FOUND
    )) as RouterRef;

    if (componentRef === NOT_FOUND) {
      return this._createInjectable();
    }

    return this._createRouter();
  }

  private async _createInjectable() {}

  private async _createRouter() {}
}
