import { ICommandOptions } from '.';
import { getGlobalMetadataStorage } from '../metadata/getMetadataStorage';

export function Command(options: ICommandOptions) {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    getGlobalMetadataStorage().commandHandles.push({
      options: options,
      propertyName: propertyKey,
      descriptor: descriptor,
      target: target.constructor,
    });
  };
}
