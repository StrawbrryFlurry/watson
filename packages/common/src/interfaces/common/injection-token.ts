import { InjectableOptions, InjectorLifetime, ProvidedInScope } from '@decorators';
import { Type } from '@interfaces';

import { WATSON_PROV_LIFETIME, WATSON_PROV_SCOPE } from '../..';

const INJECTION_TOKE_PREFIX = "InjectionToken";

export type Providable<T = any> = InjectionToken<T> | Type<T>;

export function isInjectionToken(obj: any): obj is InjectionToken {
  return obj instanceof InjectionToken;
}

export class InjectionToken<T /* The value that this token provides */ = any> {
  public readonly name: string;

  public readonly [WATSON_PROV_LIFETIME]: InjectorLifetime;
  public readonly [WATSON_PROV_SCOPE]: ProvidedInScope;

  constructor(
    private readonly _description: string,
    options: InjectableOptions = {}
  ) {
    this.name = `${INJECTION_TOKE_PREFIX} ${this._description}`;
    const { lifetime, providedIn } = options;

    this[WATSON_PROV_LIFETIME] = lifetime ?? InjectorLifetime.Singleton;
    this[WATSON_PROV_SCOPE] = providedIn ?? "root";
  }
}
