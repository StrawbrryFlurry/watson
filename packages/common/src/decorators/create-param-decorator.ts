import { COMMAND_ARGUMENTS } from '../constants';
import { CommandParam } from '../enums';
import { ExecutionContext } from '../interfaces';

export type ParamFactoryFunction = (ctx: ExecutionContext<unknown>) => unknown;

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
      Reflect.getMetadata(COMMAND_ARGUMENTS, target.constructor, propertyKey) ||
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
      COMMAND_ARGUMENTS,
      args,
      target.constructor,
      propertyKey
    );
  };
}

export function createCustomParamDecorator(paramFactory: ParamFactoryFunction) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const existing: IParamDecoratorMetadata[] =
      Reflect.getMetadata(COMMAND_ARGUMENTS, target.constructor, propertyKey) ||
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
      COMMAND_ARGUMENTS,
      args,
      target.constructor,
      propertyKey
    );
  };
}
