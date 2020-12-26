import { CommandParam } from '../enums';
import { ExecutionContext } from '../interfaces/execution-context.interface';

export type ParamFactoryFunction = (ctx: ExecutionContext) => unknown;

export interface IParamDecoratorMetadata<O = any> {
  type: string;
  options: O;
  factory?: ParamFactoryFunction;
}

export function createParamDecorator<O = any>(
  parm: CommandParam,
  options?: O
): ParameterDecorator {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: ParamFactoryFunction[] =
      Reflect.getMetadata("", target.constructor, propertyKey) || [];
    Reflect.defineMetadata("", {}, target.constructor, propertyKey);
  };
}

export function createCustomParamDecorator(paramFactory: ParamFactoryFunction) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    Reflect.getMetadata("", target.constructor, propertyKey);
    Reflect.defineMetadata("", {}, target.constructor, propertyKey);
  };
}

function applyParamMetadata() {}
