import {
  CommandTokenKind,
  IChannelMentionToken,
  IDashDashToken,
  IDashToken,
  IEndOfMessageToken,
  IGenericToken,
  INewLineToken,
  INumberToken,
  IStringToken,
  IToken,
  ITokenPosition,
  IUserMentionToken,
  IWhiteSpaceToken,
} from '@watsonjs/common';
import { Channel, Client, User } from 'discord.js';

export enum TokenKindIdentifier {
  SingleQuote = "'",
  DoubleQuote = '"',
  Dash = "-",
  /* New lines */
  LineFeed = "\n",
  CharacterReturn = "\r",
  FormattedPageBreak = "\f",
  /* White spaces */
  WhiteSpace = " ",
  HorizontalTab = "\t",
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

export class DiscordToken extends Token<CommandTokenKind> {
  getId(): string {
    const [id] = this.text.match(/\d/);
    return id;
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

export class GenericToken
  extends Token<CommandTokenKind>
  implements IGenericToken
{
  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.Generic, text, position);
    this.text = text;
  }
}

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

export class StringToken
  extends Token<CommandTokenKind>
  implements IStringToken
{
  value: string;

  constructor(text: string, position: ITokenPosition) {
    super(CommandTokenKind.String, text, position);
    this.text = text;
    this.value = String(text);
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
