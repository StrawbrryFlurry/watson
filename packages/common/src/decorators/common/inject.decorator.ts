import { INJECT_DEPENDENCY_METADATA } from "../../constants";
import { Type } from "../../interfaces";
import { isFunction } from "../../utils";

export interface IInjectValue {
  propertyKey: string;
  parameterIndex: number;
  token: string;
}

export function Inject(token: Type | string): ParameterDecorator {
  let injectionToken = token;

  if (isFunction(token)) {
    injectionToken = (token as Type).name;
  }

  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const value: IInjectValue = {
      token: injectionToken as string,
      propertyKey: propertyKey,
      parameterIndex: parameterIndex,
    };
    Reflect.defineMetadata(INJECT_DEPENDENCY_METADATA, value, target);
  };
}
