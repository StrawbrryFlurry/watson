import { _Injector } from '@injector';

export class Binding<T = any, V = any> {
  type: T;
  value: V;
  host: _Injector;
}
