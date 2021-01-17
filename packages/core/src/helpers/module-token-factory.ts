import { DynamicModule, isFunction, Type } from '@watsonjs/common';
import * as hash from 'object-hash';

export class ModuleTokenFactory {
  private moduleTokenCache = new Map<Type, string>();

  constructor() {}

  public generateModuleToken(metatype: Type | DynamicModule) {
    metatype = this.getMetatype(metatype);
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

  private generateToken(module: Type | DynamicModule) {
    const moduleName = this.getModuleName(module);

    return hash(moduleName);
  }

  private getMetatype(module: Type | DynamicModule): Type {
    return this.isDynamicModule(module as DynamicModule)
      ? (module as DynamicModule).module
      : (module as Type);
  }

  private getModuleName(module: Type | DynamicModule) {
    if (this.isDynamicModule(module as DynamicModule)) {
      return (module as DynamicModule).module.name;
    } else {
      return isFunction(module) ? (module as Type).name : module;
    }
  }

  private isDynamicModule(module: DynamicModule) {
    return module && "module" in module;
  }
}
