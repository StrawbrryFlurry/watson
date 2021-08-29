import { INJECTABLE_METADATA } from '@constants';
import { mergeDefaults } from '@utils';

export enum InjectionScope {
  Singleton,
  Request,
  Transient,
}

export interface InjectableOptions {
  scope?: InjectionScope;
}

const DEFAULT_SCOPE = InjectionScope.Singleton;

export function Injectable(options?: InjectableOptions): ClassDecorator {
  const metadata = mergeDefaults(options, {
    scope: DEFAULT_SCOPE,
  });

  return (target: Object) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, metadata, target);
  };
}
