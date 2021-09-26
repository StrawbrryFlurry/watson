import { Type } from '@interfaces';

import { InjectorElementId, WATSON_ELEMENT_ID } from '../..';

const INJECTION_TOKE_PREFIX = "InjectionToken";

export type Providable<T = any> = InjectionToken<T> | Type<T>;

export function isInjectionToken(obj: any): obj is InjectionToken {
  return obj instanceof InjectionToken;
}

export class InjectionToken<T /* The value that this token provides */ = any> {
  public readonly name: string;

  constructor(
    private readonly _description: string,
    providedIn?: InjectorElementId | number
  ) {
    this.name = `${INJECTION_TOKE_PREFIX} ${this._description}`;

    if (providedIn) {
      this[WATSON_ELEMENT_ID] = providedIn;
    }
  }
}
