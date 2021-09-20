import { Type } from '@interfaces';

const INJECTION_TOKE_PREFIX = "InjectionToken";

export type Providable<T = any> = InjectionToken | Type<T>;

export class InjectionToken {
  public readonly name: string;

  constructor(private readonly _description: string) {
    this.name = `${INJECTION_TOKE_PREFIX} ${this._description}`;
  }
}
