import { CommandArgument, CommandArgumentType, ICommandParam } from '@watsonjs/common';
import { Message } from 'discord.js';

export class CommandArgumentWrapper<T = any> implements CommandArgument {
  public readonly name: string;
  public readonly choices: any;
  public readonly dateFormat: string;
  public readonly type: CommandArgumentType;
  public readonly default: any;
  public readonly hungry: boolean;
  public readonly label: string;
  public readonly optional: boolean;
  public readonly promt: string;
  public readonly parser?: (message: Message) => any;
  public readonly param: ICommandParam;
  public readonly namedParamContent: string;
  public readonly isNamed: boolean;

  public content: string;
  public isResolved: boolean;
  public value: T;

  constructor(args: Partial<CommandArgument>) {
    this.init(args);
  }

  public resolveValue(value: T) {
    this.value = value;
    this.isResolved = true;
  }

  private init(withData: Partial<CommandArgument>) {
    const isResolved = withData.isResolved || false;
    Object.assign(this, { ...withData, isResolved });
  }
}
