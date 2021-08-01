import {
  CommandAstType,
  IAstArgument,
  IAstCommand,
  IAstPrefix,
  ICommandAst,
  IGenericToken,
  IPrefixToken,
  ITokenPosition,
} from '@watsonjs/common';

export class AstPrefix implements IAstPrefix {
  public readonly type: CommandAstType.Prefix;
  public readonly position: ITokenPosition;
  public readonly text: string;
  public value?: string;

  constructor(token: IPrefixToken) {
    const { text, position } = token;
    this.text = text;
    this.value = text;
    this.position = position;
  }
}

export class AstCommand implements IAstCommand {
  public readonly type: CommandAstType.Command;
  public readonly position: ITokenPosition;
  public readonly text: string;
  public value?: string;
  /** Sub commands for this command */
  subCommand?: IAstCommand[];

  constructor(token: IGenericToken) {
    const { text, position } = token;
    this.text = text;
    this.value = text;
    this.position = position;
  }
}

export class AstArgument<T = any> implements IAstArgument<T> {
  public readonly type: CommandAstType.Argument;
  public readonly position: ITokenPosition;
  public readonly text: string;
  public value?: T;
  public parameter: { type: CommandAstType.Parameter; name: string };
}

export class CommandAst implements ICommandAst {
  public readonly type: CommandAstType.WatsonCommand;
  public prefix: IAstPrefix;
  public command: IAstCommand;
  public arguments: { [x: string]: IAstArgument };
}
