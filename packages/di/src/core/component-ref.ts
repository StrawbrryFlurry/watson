import { Binding, createBinding, getInjectableDef } from '@di/core/binding';
import { ComponentFactoryRef } from '@di/core/component-factory';
import { Injector, InjectorGetResult, NOT_FOUND, ProviderResolvable } from '@di/core/injector';
import { ModuleRef } from '@di/core/module-ref';
import { UniqueTypeArray } from '@di/data-structures';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime, Providable, ValueProvider } from '@di/providers';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

@Injectable({ providedIn: "component", lifetime: InjectorLifetime.Module })
export abstract class ComponentRef<T extends Type = any> implements Injector {
  public parent: ModuleRef | null;
  public readonly metatype: T;

  public get name() {
    return this.metatype.name;
  }

  protected _injector: Injector;

  /**
   * Context providers are not bound to the injector of the
   * component or the module but instead are bound to
   * every context injector created for- an event bound in this
   * router.
   */
  private _contextProviders = new UniqueTypeArray<Binding>();
  constructor(
    metatype: T,
    providers: ProviderResolvable[],
    moduleRef: ModuleRef
  ) {
    this.metatype = metatype;
    this.parent = moduleRef;

    const injectorProviders = this._bindProviders(providers);
    this._injector = Injector.create(
      [
        ...injectorProviders,
        metatype,
        {
          provide: ComponentRef,
          useValue: this,
          multi: false,
        } as ValueProvider,
        {
          provide: ComponentFactoryRef,
          useFactory: () =>
            this.parent?.componentFactoryResolver.resolve(this.metatype),
        },
      ],
      moduleRef,
      moduleRef
    );
  }

  protected _bindProviders(
    providers: ProviderResolvable[]
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getInjectableDef(provider);

        if (providedIn === "ctx") {
          this._contextProviders.add(createBinding(provider));
          return false;
        }
        return provider;
      })
      .filter(Boolean) as ProviderResolvable[];
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R> {
    const resolved = await this._injector.get(typeOrToken, NOT_FOUND, ctx);

    /**
     * It's okay for component injectors not to
     * have all providers that they require
     * to resolve a given value. Usually we
     * need to use the module injector which
     * holds all resolvable providers available
     * to components in their module scope.
     */
    if (resolved === NOT_FOUND) {
      if (isNil(this.parent)) {
        // If the router isn't part of a module, throw a NullInjector error.
        return Injector.NULL.get(typeOrToken, notFoundValue);
      }

      return this.parent.get(typeOrToken, notFoundValue, ctx);
    }

    return resolved as R;
  }
}

export class ɵComponentRefImpl extends ComponentRef {}
