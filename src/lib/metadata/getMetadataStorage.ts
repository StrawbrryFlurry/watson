import { BotMetadataStorage } from './MetadataStorage';

export function getGlobalMetadataStorage(): BotMetadataStorage {
  const globalScope = global as any;

  if (!globalScope.botMetadataStorage) {
    globalScope.botMetadataStorage = new BotMetadataStorage();
  }

  return globalScope.botMetadataStorage;
}
