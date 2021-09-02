import {
  AstArgument,
  AstCommand,
  AstPrefix,
  CommandAst,
  CommandAstType,
  GenericToken,
  ParsedAstArguments,
  PrefixToken,
  TokenPosition,
} from '@watsonjs/common';
import {
  ParameterConfiguration,
} from 'packages/common/src/interfaces/router/configuration/parameter-configuration.interface';

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
  public readonly subCommand: AstCommand[] = [];

  constructor(token: GenericToken) {
    const { text, position } = token;
    this.text = text;
    this.value = text;
    this.position = position;
  }

  public applySubCommand(token: GenericToken): void {
    const subCommandAst = new AstCommandImpl(token);
    this.subCommand.push(subCommandAst);
  }
}

export class AstArgumentImpl<T = any> implements AstArgument<T> {
  public readonly type: CommandAstType.Argument;
  public readonly position: TokenPosition;
  public readonly text: string;
  public value?: T;
  public parameter: { type: CommandAstType.Parameter; name: string };

  constructor(
    position: TokenPosition,
    text: string,
    parameter: ParameterConfiguration,
    value: T
  ) {
    this.position = position;
    this.text = text;
    this.value = value;
    this.parameter = {
      type: CommandAstType.Parameter,
      name: parameter.name,
    };
  }
}

export class CommandAstImpl<T = any> implements CommandAst<T> {
  public readonly type: CommandAstType.WatsonCommand;
  public prefix: AstPrefix;
  public command: AstCommand;
  public arguments: ParsedAstArguments<T>;

  public applyPrefix(prefix: AstPrefix) {
    this.prefix = prefix;
    return this;
  }

  public applyCommand(command: AstCommand) {
    this.command = command;
    return this;
  }

  public applyArguments(argument: ParsedAstArguments<T>) {
    this.arguments = argument;
    return this;
  }
}
