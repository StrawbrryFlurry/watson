import { getGlobalMetadataStorage } from '../metadata/getMetadataStorage';
import { IBotCommandOptions } from './interfaces/bot-command-options.interface';

export function BotCommand(options?: IBotCommandOptions) {
  return (target: any) => {
    getGlobalMetadataStorage().commandClasses.push({
      target,
      options,
    });
  };
}
