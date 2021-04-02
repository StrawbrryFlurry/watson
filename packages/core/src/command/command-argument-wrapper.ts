import {
  ArgumentPromtFunction,
  CommandArgument,
  CommandArgumentType,
  isNil,
} from "@watsonjs/common";
import { Message } from "discord.js";

import { CommandArgumentsHost } from "./pipe";

export class CommandArgumentWrapper<T = any> implements CommandArgument {
  public readonly name: string;
  public readonly choices: any;
  public readonly dateFormat: string;
  public readonly type: CommandArgumentType;
  public readonly default: any;
  public readonly hungry: boolean;
  public readonly label: string;
  public readonly optional: boolean;
  public readonly promt: string | ArgumentPromtFunction;
  public readonly parser?: (message: Message) => any;
  public readonly namedParamContent: string;
  public readonly isNamed: boolean;
  public readonly message: Message;

  public host: CommandArgumentsHost;

  public content: string | string[];
  public isResolved: boolean;
  public value: T;

  constructor(args: Partial<CommandArgument>) {
    this.init(args);
  }

  public resolveValue(value: T) {
    this.value = value;
    this.isResolved = true;
  }

  private init({
    isNamed = false,
    isResolved = false,
    ...withData
  }: Partial<CommandArgument>) {
    const { host } = withData;
    const message = isNil(host) ? withData.message : host.message;

    Object.assign(this, { ...withData, isResolved, message });
  }
}
