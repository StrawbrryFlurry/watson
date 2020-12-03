import { getGlobalMetadataStorage } from '../metadata';
import { IBotEventOptions } from './interfaces';

export function BotEvent(options?: IBotEventOptions) {
  return (target: any) => {
    getGlobalMetadataStorage().eventClasses.push({
      target,
      options,
    });
  };
}
