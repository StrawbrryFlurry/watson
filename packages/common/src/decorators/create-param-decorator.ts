import { PARAM_METADATA } from '../constants';
import { RouteParamType } from '../enums';
import { ExecutionContext } from '../interfaces';

export type ParamFactoryFunction = (ctx: ExecutionContext) => unknown;

export interface IParamDecoratorMetadata<O = any> {
  type: RouteParamType;
  paramIndex: number;
  options?: O;
  factory?: ParamFactoryFunction;
}

export function createParamDecorator<O = any>(
  parm: RouteParamType,
  options?: O
): ParameterDecorator {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: IParamDecoratorMetadata[] =
      Reflect.getMetadata(PARAM_METADATA, target.constructor, propertyKey) ||
      [];

    const args = [
      ...existing,
      {
        paramIndex: parameterIndex,
        type: parm,
        options: options,
      } as IParamDecoratorMetadata,
    ];

    Reflect.defineMetadata(
      PARAM_METADATA,
      args,
      target.constructor,
      propertyKey
    );
  };
}

export function createCustomParamDecorator(paramFactory: ParamFactoryFunction) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: IParamDecoratorMetadata[] =
      Reflect.getMetadata(PARAM_METADATA, target.constructor, propertyKey) ||
      [];

    const args = [
      ...existing,
      {
        type: "param:factory",
        paramIndex: parameterIndex,
        factory: paramFactory,
      } as IParamDecoratorMetadata,
    ];

    Reflect.defineMetadata(
      PARAM_METADATA,
      args,
      target.constructor,
      propertyKey
    );
  };
}
