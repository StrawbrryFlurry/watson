import {
  CommandTokenKind,
  IChannelMentionToken,
  ICodeBlockToken,
  IDashDashToken,
  IDashToken,
  IEndOfMessageToken,
  IGenericToken,
  IIdentifierToken,
  INewLineToken,
  INumberToken,
  IParameterToken,
  IPrefixToken,
  IStringExpandableToken,
  IStringLiteralToken,
  IStringTemplateToken,
  IToken,
  ITokenPosition,
  IUserMentionToken,
  IWhiteSpaceToken,
} from '@watsonjs/common';
import { Channel, Client, User } from 'discord.js';

export enum TokenKindIdentifier {
  /** String identifier */
  SingleQuote = "'",
  /** String identifier */
  DoubleQuote = '"',
  /** String identifier */
  BackTick = "`",
  /** Parameter identifier */
  Dash = "-",
  /** Discord identifier */
  LessThan = "<",
  /** Discord identifier */
  GreaterThan = ">",
  /** Discord identifier */
  DollarSign = "$",
  /** Discord identifier */
  NumberSign = "#",
  /** Discord identifier */
  AmpersandSign = "&",
  /** At Sign */
  AtSign = "@",
  /** New line */
  LineFeed = "\n",
  /** New line */
  CharacterReturn = "\r",
  /** New line */
  FormattedPageBreak = "\f",
  /** White space */
  WhiteSpace = " ",
  /** White space */
  HorizontalTab = "\t",
  /** White space */
  VerticalTab = "\v",
}

export class Token<T = any> implements IToken<T> {
  public text: string;
  public kind: T;
  public position: ITokenPosition;

  constructor(kind: T, text: string, position: ITokenPosition) {
    this.kind = kind;
    this.text = text;
    this.position = position;
  }
}

export class TokenPosition implements ITokenPosition {
  public tokenStart: number;
  public tokenEnd: number;
  public text: string;

  constructor(text: string, tokenStart: number, tokenEnd: number) {
    this.tokenStart = tokenStart;
    this.tokenEnd = tokenEnd;
    this.text = text;
  }
}

export class DiscordToken extends Token<CommandTokenKind> {
  getId(): string {
    const [id] = this.text.match(/\d/);
    return id;
  }
}

export class GenericToken
  extends Token<CommandTokenKind>
  implements IGenericToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Generic, text, position);
    this.text = text;
  }
}

export class IdentifierToken
  extends Token<CommandTokenKind>
  implements IIdentifierToken
{
  public value: string;

  constructor(value: string, text: string, position: ITokenPosition) {
    super(CommandTokenKind.Identifier, text, position);
    this.text = text;
    this.value = value;
  }
}

export class ParameterToken
  extends Token<CommandTokenKind>
  implements IParameterToken
{
  public value: string;
  public doubleDashed: boolean;

  constructor(
    value: string,
    text: string,
    doubleDashed: boolean,
    position: ITokenPosition
  ) {
    super(CommandTokenKind.Generic, text, position);
    this.text = text;
    this.value = value;
    this.doubleDashed = doubleDashed;
  }
}

export class PrefixToken
  extends Token<CommandTokenKind>
  implements IPrefixToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Prefix, text, position);
  }
}

export class NumberToken
  extends Token<CommandTokenKind>
  implements INumberToken
{
  value: number;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Number, text, position);
    this.text = text;
    this.value = Number(text);
  }
}

export class StringExpandableToken
  extends Token<CommandTokenKind>
  implements IStringExpandableToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.StringExpandable, text, position);
    this.text = `"${text}"`;
    this.value = String(text);
  }
}

export class StringLiteralToken
  extends Token<CommandTokenKind>
  implements IStringLiteralToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.StringLiteral, text, position);
    this.text = `'${text}'`;
    this.value = String(text);
  }
}

export class StringTemplateToken
  extends Token<CommandTokenKind>
  implements IStringTemplateToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.StringTemplate, text, position);
    this.text = `\`${text}\``;
    this.value = String(text);
  }
}

export class ChannelMentionToken
  extends DiscordToken
  implements IChannelMentionToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.ChannelMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getChannel(client: Client): Promise<Channel> {
    const id = this.getId();
    return client.channels.fetch(id);
  }
}

export class UserMentionToken
  extends DiscordToken
  implements IUserMentionToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.UserMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getUser(client: Client): Promise<User> {
    const id = this.getId();
    return client.users.fetch(id);
  }
}

export class RoleMentionToken
  extends DiscordToken
  implements IUserMentionToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.RoleMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getUser(client: Client): Promise<User> {
    const id = this.getId();
    return client.users.fetch(id);
  }
}

export class CodeBlockToken extends Token implements ICodeBlockToken {
  public language: string;
  public value: string;

  constructor(
    text: string,
    codeblock: string,
    language: string,
    position: ITokenPosition
  ) {
    super(CommandTokenKind.CodeBlock, text, position);
    this.value = codeblock;
    this.language = language;
  }
}

/**
 * !==========================================================================================================!
 * The default tokenizer is not going to generate
 * a token of this kind.
 *
 * If you need to have access to these tokens in
 * your program please implement your own tokenizer.
 */
export class NewLineToken
  extends Token<CommandTokenKind>
  implements INewLineToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.NewLine, text, position);
    this.text = text;
  }
}

export class WhiteSpaceToken
  extends Token<CommandTokenKind>
  implements IWhiteSpaceToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.WhiteSpace, text, position);
    this.text = text;
  }
}

export class DashToken extends Token<CommandTokenKind> implements IDashToken {
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Dash, text, position);
    this.text = text;
  }
}

export class DashDashToken
  extends Token<CommandTokenKind>
  implements IDashDashToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.DashDash, text, position);
    this.text = text;
  }
}

export class EndOfMessageToken
  extends Token<CommandTokenKind>
  implements IEndOfMessageToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Eom, text, position);
    this.text = text;
  }
}
