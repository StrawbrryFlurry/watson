import {
  ICommandArgumentToInject,
  ICommandClassMetadata,
  ICommandHandleMetadata,
  IEventClassMetadata,
  IEventHandleMetadata,
} from './interfaces';

export class BotMetadataStorage {
  public readonly commandHandles: ICommandHandleMetadata[] = [];
  public readonly commandClasses: ICommandClassMetadata[] = [];
  public readonly commandArgumentToInject: ICommandArgumentToInject[] = [];
  public readonly eventHandles: IEventHandleMetadata[] = [];
  public readonly eventClasses: IEventClassMetadata[] = [];

  public getCommandHanleByClass(target: Function) {
    return this.commandHandles.filter((command) => command.target === target);
  }
}
