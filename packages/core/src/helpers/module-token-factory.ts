import { isFunction, Type } from '@watson/common';
import * as hash from 'object-hash';

export class ModuleTokenFactory {
  private moduleTokenCache = new Map<Type, string>();

  constructor() {}

  public generateModuleToken(metatype: Type) {
    const token = this.getTokenByModuleType(metatype);

    if (token) {
      return token;
    }

    const moduleToken = this.generateToken(metatype);
    this.moduleTokenCache.set(metatype, moduleToken);

    return moduleToken;
  }

  public getTokenByModuleType(metatype: Type) {
    if (this.moduleTokenCache.has(metatype)) {
      return this.moduleTokenCache.get(metatype);
    }
    return undefined;
  }

  private generateToken(module: Type | string) {
    const moduleName = isFunction(module) ? (module as Type).name : module;

    return hash(moduleName);
  }
}
