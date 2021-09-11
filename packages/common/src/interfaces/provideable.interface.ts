import { Type } from ".";

export type InjectionToken = any;
export type Providable<T = any> = Type<T> | InjectionToken;
