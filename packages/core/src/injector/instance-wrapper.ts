import { Type } from '@watson/common';
import { v4 } from 'uuid';

import { IInstanceType } from '../interfaces';
import { MetadataResolver } from './metadata-resolver';

/**
 * Wraps around Provicer, Receiver and Module instaces
 * Provides init options and dependencies
 */
export class InstanceWrapper<T = any> {
  public constructorParams: Type[];
  public instanceId: string;
  public type: IInstanceType;

  private resolver = new MetadataResolver();

  private instance: T;

  resolveConstructor() {}

  resolveModuleMetadata() {
    return this.resolver.resolveModuleMetadata(this.instance);
  }

  constructor(inputType: Type) {
    this.instanceId = v4();

    this.constructorParams = this.resolver.resolveConstructorParams(inputType);
  }
}
