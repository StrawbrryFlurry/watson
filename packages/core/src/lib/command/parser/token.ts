import {
  ChannelMentionToken,
  CodeBlockToken,
  CommandTokenKind,
  DashToken,
  EmoteToken,
  EndOfMessageToken,
  GenericToken,
  IdentifierToken,
  NewLineToken,
  NumberToken,
  ParameterToken,
  PrefixToken,
  RoleMentionToken,
  StringExpandableToken,
  StringLiteralToken,
  StringTemplateToken,
  Token,
  TokenPosition,
  UserMentionToken,
  WhiteSpaceToken,
} from '@watsonjs/common';

export enum TokenKindIdentifier {
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

export class TokenImpl<T = any> implements Token<T> {
  public text: string | null;
  public kind: T | null;
  public position: TokenPosition;

  constructor(kind: T | null, text: string | null, position: TokenPosition) {
    this.kind = kind;
    this.text = text;
    this.position = position;
  }

  public toString(): string {
    return this.text ?? "";
  }
}

/**
 * A token that was not parsed form
 * a message string but generated
 * by the framework.
 */
export class NullToken implements Token<CommandTokenKind> {
  text: string | null;
  kind: CommandTokenKind;
  position: TokenPosition;

  constructor(text?: string | null) {
    const tokenText = text ?? null;
    this.text = tokenText;
    this.kind = CommandTokenKind.None;
    this.position = new TokenPositionImpl(tokenText, null, null);
  }
}

export class TokenPositionImpl implements TokenPosition {
  public tokenStart: number | null;
  public tokenEnd: number | null;
  public text: string | null;

  constructor(
    text: string | null,
    tokenStart: number | null,
    tokenEnd: number | null
  ) {
    this.tokenStart = tokenStart;
    this.tokenEnd = tokenEnd;
    this.text = text;
  }

  public toString() {
    return `${this.tokenStart} - ${this.tokenEnd}`;
  }
}

export class GenericTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements GenericToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Generic, text, position);
    this.text = text;
  }
}

export class IdentifierTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements IdentifierToken
{
  public value: string;

  constructor(value: string, text: string, position: TokenPosition) {
    super(CommandTokenKind.Identifier, text, position);
    this.text = text;
    this.value = value;
  }
}

export class ParameterTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements ParameterToken
{
  public value: string;
  public doubleDashed: boolean;

  constructor(value: string, doubleDashed: boolean, position: TokenPosition) {
    const text = `-${doubleDashed ? "-" : ""}${value}`;
    super(CommandTokenKind.Generic, text, position);
    this.text = text;
    this.value = value;
    this.doubleDashed = doubleDashed;
  }
}

export class PrefixTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements PrefixToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Prefix, text, position);
  }
}

export class NumberTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements NumberToken
{
  value: number;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Number, text, position);
    this.text = text;
    this.value = Number(text);
  }
}

export class StringExpandableTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements StringExpandableToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.StringExpandable, text, position);
    this.text = `"${text}"`;
    this.value = String(text);
  }
}

export class StringLiteralTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements StringLiteralToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.StringLiteral, text, position);
    this.text = `'${text}'`;
    this.value = String(text);
  }
}

export class StringTemplateTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements StringTemplateToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.StringTemplate, text, position);
    this.text = `\`${text}\``;
    this.value = String(text);
  }
}

export class ChannelMentionTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements ChannelMentionToken
{
  value: string;

  constructor(text: string, id: string, position: TokenPosition) {
    super(CommandTokenKind.ChannelMention, text, position);
    this.text = text;
    this.value = id;
  }
}

export class UserMentionTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements UserMentionToken
{
  value: string;

  constructor(text: string, id: string, position: TokenPosition) {
    super(CommandTokenKind.UserMention, text, position);
    this.text = text;
    this.value = id;
  }
}

export class RoleMentionTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements RoleMentionToken
{
  value: string;

  constructor(text: string, id: string, position: TokenPosition) {
    super(CommandTokenKind.RoleMention, text, position);
    this.text = text;
    this.value = id;
  }
}

export class EmoteTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements EmoteToken
{
  value: string | null;

  constructor(text: string, id: string | null, position: TokenPosition) {
    super(CommandTokenKind.Emote, text, position);
    this.text = text;
    this.value = id;
  }
}

export class CodeBlockTokenImpl extends TokenImpl implements CodeBlockToken {
  public language: string;
  public value: string;

  constructor(
    text: string,
    codeblock: string,
    language: string,
    position: TokenPosition
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
export class NewLineTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements NewLineToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.NewLine, text, position);
    this.text = text;
  }
}

export class WhiteSpaceTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements WhiteSpaceToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.WhiteSpace, text, position);
    this.text = text;
  }
}

export class DashTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements DashToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Dash, text, position);
    this.text = text;
  }
}

export class EndOfMessageTokenImpl
  extends TokenImpl<CommandTokenKind>
  implements EndOfMessageToken
{
  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Eom, text, position);
    this.text = text;
  }
}
