import { Binding } from '@di/core/binding';
import { Injector, InjectorGetResult, ProviderResolvable } from '@di/core/injector';
import { ɵbindProviders, ɵcreateBindingInstance } from '@di/core/injector-capability';
import { InquirerContext } from '@di/core/inquirer-context';
import { Providable } from '@di/providers/injection-token';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

export class ContextInjector implements Injector {
  public parent!: Injector | null;
  private _records = new Map<Providable, Binding>();

  constructor(providers: ProviderResolvable[]) {
    ɵbindProviders(this, this._records, providers);
  }

  public get<T extends Providable<any>, R extends InjectorGetResult<T, false>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector | null,
    inquirerContext: InquirerContext<
      Type<any> | Binding<any, any[], any, any> | typeof Injector
    > = new InquirerContext(ContextInjector)
  ): Promise<R> {
    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return <R>(
        this.parent?.get(typeOrToken, notFoundValue, this, inquirerContext)
      );
    }

    return ɵcreateBindingInstance(binding, this, this, inquirerContext);
  }
}
