import { ClientEvents } from 'discord.js';

import { getGlobalMetadataStorage } from '../metadata/getMetadataStorage';
import { IEventOptions } from './interfaces/event-options.interface';

export function Event<T extends keyof ClientEvents>(options: IEventOptions<T>) {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...arg: ClientEvents[T]) => void>
  ) => {
    getGlobalMetadataStorage().eventHandles.push({
      options: options,
      propertyName: propertyKey,
      descriptor: descriptor,
      target: target.constructor,
    });
  };
}
