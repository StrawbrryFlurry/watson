import {
  AstArgument,
  AstCommand,
  AstPrefix,
  CommandAst,
  CommandAstType,
  GenericToken,
  PrefixToken,
  TokenPosition,
} from '@watsonjs/common';

export class AstPrefixImpl implements AstPrefix {
  public readonly type: CommandAstType.Prefix;
  public readonly position: TokenPosition;
  public readonly text: string;
  public value?: string;

  constructor(token: PrefixToken) {
    const { text, position } = token;
    this.text = text;
    this.value = text;
    this.position = position;
  }
}

export class AstCommandImpl implements AstCommand {
  public readonly type: CommandAstType.Command;
  public readonly position: TokenPosition;
  public readonly text: string;
  public value?: string;
  /** Sub commands for this command */
  subCommand?: AstCommand[];

  constructor(token: GenericToken) {
    const { text, position } = token;
    this.text = text;
    this.value = text;
    this.position = position;
  }
}

export class AstArgumentImpl<T = any> implements AstArgument<T> {
  public readonly type: CommandAstType.Argument;
  public readonly position: TokenPosition;
  public readonly text: string;
  public value?: T;
  public parameter: { type: CommandAstType.Parameter; name: string };
}

export class CommandAstImpl implements CommandAst {
  public readonly type: CommandAstType.WatsonCommand;
  public prefix: AstPrefix;
  public command: AstCommand;
  public arguments: { [x: string]: AstArgument };
}
