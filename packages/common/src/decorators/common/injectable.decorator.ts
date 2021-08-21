import { INJECTABLE_METADATA } from '../../constants';
import { isUndefined } from '../../utils';

export type InjectionScope = "singleton" | "request" | "transient";

export interface InjectableOptions {
  scope: InjectionScope;
}

export function Injectable(
  injectableOptions?: InjectableOptions
): ClassDecorator {
  const options = isUndefined(injectableOptions)
    ? undefined
    : injectableOptions;

  return (target: Object) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, options, target);
  };
}
