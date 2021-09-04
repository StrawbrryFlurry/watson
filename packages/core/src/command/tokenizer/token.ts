import {
  ChannelMentionToken,
  CodeBlockToken,
  CommandTokenKind,
  DashToken,
  DiscordAdapter,
  EmoteToken,
  EndOfMessageToken,
  GenericToken,
  IdentifierToken,
  isNil,
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
import { Channel, Client, Emoji, Guild, Role, User } from 'discord.js';

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
  public text: string;
  public kind: T;
  public position: TokenPosition;

  constructor(kind: T, text: string, position: TokenPosition) {
    this.kind = kind;
    this.text = text;
    this.position = position;
  }
}

export class TokenPositionImpl implements TokenPosition {
  public tokenStart: number;
  public tokenEnd: number;
  public text: string;

  constructor(text: string, tokenStart: number, tokenEnd: number) {
    this.tokenStart = tokenStart;
    this.tokenEnd = tokenEnd;
    this.text = text;
  }

  public toString() {
    return `${this.tokenStart} - ${this.tokenEnd}`;
  }
}

export class DiscordTokenImpl extends TokenImpl<CommandTokenKind> {
  getId(): string {
    const [id] = this.text.match(/\d/)!;
    return id;
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
  extends DiscordTokenImpl
  implements ChannelMentionToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.ChannelMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getChannel(adapter: DiscordAdapter<Client>): Promise<Channel> {
    // TODO: Replace this with a
    // fetch method on the client adapter
    const client = adapter.getClient();
    const id = this.getId();
    return client.channels.fetch(id);
  }
}

export class UserMentionTokenImpl
  extends DiscordTokenImpl
  implements UserMentionToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.UserMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getUser(adapter: DiscordAdapter<Client>): Promise<User> {
    const client = adapter.getClient();
    const id = this.getId();
    return client.users.fetch(id);
  }
}

export class RoleMentionTokenImpl
  extends DiscordTokenImpl
  implements RoleMentionToken
{
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.RoleMention, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getRole(guild: Guild): Promise<Role> {
    const id = this.getId();
    return guild.roles.fetch(id) as Promise<Role>;
  }
}

export class EmoteTokenImpl extends DiscordTokenImpl implements EmoteToken {
  value: string;

  constructor(text: string, position: TokenPosition) {
    super(CommandTokenKind.Emote, text, position);
    this.text = text;
    this.value = this.getId();
  }

  getId(): string {
    if (!isNil(this.value)) {
      return this.value;
    }

    const withoutName = this.text.replace(/\<\:.*\:/, "");
    const [id] = withoutName.match(/\d+/)!;
    return id;
  }

  getEmote(adapter: DiscordAdapter<Client>): Emoji {
    const client = adapter.getClient();
    const id = this.getId();
    return client.emojis.resolve(id)!;
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
