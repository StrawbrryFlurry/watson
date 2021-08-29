import { Type } from '.';

export type InjectionToken = any;
export type Providable<T> = Type<T> | InjectionToken;
