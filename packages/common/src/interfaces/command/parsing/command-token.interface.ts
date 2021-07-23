import { Channel, Client, Role, User } from 'discord.js';

import { IToken } from './token.interface';

export type TNewLineCharacter = "\n" | "\r" | "\r\n";

export enum CommandTokenKind {
  /**
   * A user mention is formatted as follows: `<@USER_ID>`
   * and parsed using the {@link USER_MENTION_REGEXP}
   * regular expression.
   */
  UserMention,
  /**
   * A channel mention is formatted as follows: `<#CHANNEL_ID>`
   * and parsed using the {@link CHANNEL_MENTION_REGEXP}
   * regular expression.
   */
  ChannelMention,
  /**
   * A role mention is formatted as follows: `<@&CHANNEL_ID>`
   * and parsed using the {@link ROLE_MENTION_REGEXP}
   * regular expression.
   */
  RoleMention,
  /**
   * Double quoted string literal - `"`
   * Expandable strings could reference variables
   * in future releases
   */
  StringExpandable,
  /** Single quoted string literal - `'` */
  StringLiteral,
  /** A string string literal quoted with a single back tick - '`' */
  StringTemplate,
  /** Any numeric literal */
  Number,
  /**
   * A code block starts with three back-ticks and is ended accordingly
   * ```
   * \`\`\`ts
   *  const a = "Beep Boop";
   * \`\`\`
   * ```
   */
  CodeBlock,
  /** Text prefixed with a Dash or DoubleDash is treated as a parameter */
  Parameter,
  /**
   * Message content that could not be matched with any kind
   * @example
   * `!ban @BeepBoop being too cute 24`
   * Would would result in:
   * `!` - Prefix,
   * `ban` - Command,
   * `@BeepBoop` - UserMention,
   * `being too cute` - Generic,
   * `24` - Number
   *
   * If the matched command accepts less arguments than
   * the amount of parsed arguments and contains a text argument
   * Watson will try to figure out the correct argument by
   * adding a parsed argument following or preceding a text block back
   * to its original.
   */
  Generic,
  /** A dash for command arguments - '-' */
  Dash,
  /** A double dash for command arguments - '--' */
  DashDash,
  /** A new line character - '\n', '\r', or '\r\n' */
  NewLine,
  /** A white space character - '\w', ' ', or '\w+' */
  WhiteSpace,
  /** End of the message */
  Eom,
}

export interface ICommandTokenWithValue<T> extends IToken<CommandTokenKind> {
  value: T;
}

/** @see {@link CommandTokenKind#UserMention} */
export interface IUserMentionToken extends ICommandTokenWithValue<string> {
  getId(): string;
  getUser(client: Client): Promise<User>;
}
/** @see {@link CommandTokenKind#ChannelMention} */
export interface IChannelMentionToken extends ICommandTokenWithValue<string> {
  getId(): string;
  getChannel(client: Client): Promise<Channel>;
}
/** @see {@link CommandTokenKind#RoleMention} */
export interface IRoleMentionToken extends ICommandTokenWithValue<string> {
  getId(): string;
  getRole(client: Client): Promise<Role>;
}

/** @see {@link CommandTokenKind#CodeBlock} */
export interface ICodeBlockToken extends ICommandTokenWithValue<string> {
  language: string;
}

/** @see {@link CommandTokenKind#StringExpandable} */
export interface IStringExpandableToken
  extends ICommandTokenWithValue<string> {}
/** @see {@link CommandTokenKind#StringLiteral} */
export interface IStringLiteralToken extends ICommandTokenWithValue<string> {}
/** @see {@link CommandTokenKind#StringTemplate} */
export interface IStringTemplateToken extends ICommandTokenWithValue<string> {}
/** @see {@link CommandTokenKind#Number} */
export interface INumberToken extends ICommandTokenWithValue<number> {}

/** @see {@link CommandTokenKind#Generic} */
export interface IGenericToken extends IToken<CommandTokenKind> {}

/** @see {@link CommandTokenKind#NewLine} */
export interface INewLineToken extends IToken<CommandTokenKind> {}
/** @see {@link CommandTokenKind#WhiteSpace} */
export interface IWhiteSpaceToken extends IToken<CommandTokenKind> {}
/** @see {@link CommandTokenKind#EOM} */
export interface IEndOfMessageToken extends IToken<CommandTokenKind> {}
/** @see {@link CommandTokenKind#Dash} */
export interface IDashToken extends IToken<CommandTokenKind> {}
/** @see {@link CommandTokenKind#DashDash} */
export interface IDashDashToken extends IToken<CommandTokenKind> {}
