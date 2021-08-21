import { INJECT_DEPENDENCY_METADATA } from '../../constants';
import { Type } from '../../interfaces';
import { isFunction } from '../../utils';

export interface InjectValue {
  propertyKey: string | symbol;
  parameterIndex: number;
  provide: string;
}

export function Inject(token: Type | string): ParameterDecorator {
  let injectionToken = token;

  if (isFunction(token)) {
    injectionToken = (token as Type).name;
  }

  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const existing =
      Reflect.getMetadata(INJECT_DEPENDENCY_METADATA, target.constructor) || [];

    const value: InjectValue = {
      provide: injectionToken as string,
      propertyKey: propertyKey,
      parameterIndex: parameterIndex,
    };

    const metadata = [...existing, value];
    Reflect.defineMetadata(INJECT_DEPENDENCY_METADATA, metadata, target);
  };
}
