import { PROPERTY_KEY_METADATA } from '../constants';
import { CommandParam } from '../enums';
import { ExecutionContext } from '../interfaces';

export type ParamFactoryFunction = (ctx: ExecutionContext) => unknown;

export interface IParamDecoratorMetadata<O = any> {
  type: CommandParam;
  paramIndex: number;
  options?: O;
  factory?: ParamFactoryFunction;
}

export function createParamDecorator<O = any>(
  parm: CommandParam,
  options?: O
): ParameterDecorator {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: IParamDecoratorMetadata[] =
      Reflect.getMetadata(
        PROPERTY_KEY_METADATA,
        target.constructor,
        propertyKey
      ) || [];

    const args = [
      ...existing,
      {
        paramIndex: parameterIndex,
        type: parm,
        options: options,
      } as IParamDecoratorMetadata,
    ];

    Reflect.defineMetadata(
      PROPERTY_KEY_METADATA,
      args,
      target.constructor,
      propertyKey
    );
  };
}

export function createCustomParamDecorator(paramFactory: ParamFactoryFunction) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: IParamDecoratorMetadata[] =
      Reflect.getMetadata(
        PROPERTY_KEY_METADATA,
        target.constructor,
        propertyKey
      ) || [];

    const args = [
      ...existing,
      {
        type: "param:factory",
        paramIndex: parameterIndex,
        factory: paramFactory,
      } as IParamDecoratorMetadata,
    ];

    Reflect.defineMetadata(
      PROPERTY_KEY_METADATA,
      args,
      target.constructor,
      propertyKey
    );
  };
}
