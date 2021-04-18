import { DESIGN_PARAMETERS, DESIGN_RETURN_TYPE, Type } from '@watsonjs/common';

export class Scanner {
  public reflectTypeMethodParameters<T extends unknown[] = unknown[]>(
    metatype: Type,
    propertyKey?: string
  ): T {
    return Reflect.getMetadata(DESIGN_PARAMETERS, metatype, propertyKey) || [];
  }

  public reflectMethodReturnType(metatype: Type, propertyKey: string) {
    Reflect.getMetadata(DESIGN_RETURN_TYPE, metatype, propertyKey);
  }
}
