import { getGlobalMetadataStorage } from '../metadata';

export function EventArg() {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    getGlobalMetadataStorage().commandArgumentToInject.push({
      target,
      propertyKey,
      parameterIndex,
    });

    return null as any;
  };
}
