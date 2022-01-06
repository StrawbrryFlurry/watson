import { AbstractInjectableFactoryResolver } from '@di/core/abstract-factory';
import { ModuleRef } from '@di/core/module-ref';
import { ProviderFactory } from '@di/core/provider-factory';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectableOptions, InjectorLifetime } from '@di/providers/injection-token';
import { isType, Type } from '@di/types';
import { stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

/**
 * The `ProviderFactoryResolver` can be used
 * to create `ProviderFactoryRef`s of a type
 * that was not previously registered in any
 * module or component.
 *
 * Beware that we can only reflect constructor
 * metadata of classes that are decorated. If
 * your provider class is not decorated, we
 * can't resolve it's dependencies and thus
 * call the constructor with no arguments.
 */
@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class ProviderFactoryResolver extends AbstractInjectableFactoryResolver {
  public abstract resolve<T extends Type>(
    provider: T,
    /** Providing a ModuleRef here doesn't do anything. */
    moduleRef?: ModuleRef | null,
    injectableOptions?: InjectableOptions
  ): Promise<ProviderFactory<T>>;
}

export class ProviderFactoryResolverImpl extends ProviderFactoryResolver {
  public async resolve<T extends Type>(
    provider: T,
    moduleRef: ModuleRef | null = null,
    injectableOptions?: InjectableOptions
  ): Promise<ProviderFactory<T>> {
    if (!isType(provider)) {
      throw `Cannot create instance of type ${stringify(provider)}`;
    }

    const factory = this._records.get(provider);

    if (!isNil(factory)) {
      return <ProviderFactory<T>>factory;
    }

    const providerFactory = new ProviderFactory<T>(provider, this._injector);
    this._records.set(provider, providerFactory);
    return providerFactory;
  }
}
