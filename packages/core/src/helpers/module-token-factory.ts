import { Type } from '@watson/common';
import { v4 } from 'uuid';

export class ModuleTokenFactory {
  private moduleTokenCache = new Map<Type, string>();

  constructor() {}

  public generateModuleToken(metatype: Type) {
    const token = this.getTokenByModuleType(metatype);

    if (token) {
      return token;
    }

    const moduleToken = this.generateToken();
    this.moduleTokenCache.set(metatype, moduleToken);

    return moduleToken;
  }

  public getTokenByModuleType(metatype: Type) {
    if (this.moduleTokenCache.has(metatype)) {
      return this.moduleTokenCache.get(metatype);
    }
    return undefined;
  }

  private generateToken() {
    return v4();
  }
}
