import { AbstractInjectableFactoryResolver } from '@di/core/abstract-factory';
import { ModuleRef } from '@di/core/module-ref';
import { ProviderFactory } from '@di/core/provider-factory';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectableOptions, InjectorLifetime } from '@di/providers/injection-token';
import { isType, Type } from '@di/types';
import { stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class ProviderFactoryResolver extends AbstractInjectableFactoryResolver {}

export class ProviderFactoryResolverImpl extends ProviderFactoryResolver {
  public async resolve<T extends Type>(
    provider: T,
    /** Providing a ModuleRef here doesn't do anything. */
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

    const providerFactory = new ProviderFactory<T>(provider, this._moduleRef);
    this._records.set(provider, providerFactory);
    return providerFactory;
  }
}
