import { DiscordAdapter } from '@interfaces';
import { Channel, Emoji, Guild, Role, User } from 'discord.js';

import { Token } from './token.interface';

export type NewLineCharacter = "\n" | "\r" | "\r\n";

export enum CommandTokenKind {
  None = 1,
  /**
   * A user mention is formatted as follows: `<@USER_ID>`
   * and parsed using the {@link USER_MENTION_REGEXP}
   * regular expression.
   */
  UserMention = 2,
  /**
   * A channel mention is formatted as follows: `<#CHANNEL_ID>`
   * and parsed using the {@link CHANNEL_MENTION_REGEXP}
   * regular expression.
   */
  ChannelMention = 4,
  /**
   * A role mention is formatted as follows: `<@&CHANNEL_ID>`
   * and parsed using the {@link ROLE_MENTION_REGEXP}
   * regular expression.
   */
  RoleMention = 8,
  /**
   * An emote is formatted as follows: `<:EMOTE_NAME:EMOTE_ID`
   * <:ayy:305818615712579584>
   */
  Emote = 16,
  /**
   * Double quoted string literal - `"`
   * Expandable strings could reference variables
   * in future releases
   */
  StringExpandable = 32,
  /** Single quoted string literal - `'` */
  StringLiteral = 64,
  /** A string string literal quoted with a single back tick - '`' */
  StringTemplate = 128,
  /** Any numeric literal */
  Number = 256,
  /**
   * A code block starts with three back-ticks and is ended accordingly
   * ```
   * \`\`\`ts
   *  const a = "Beep Boop";
   * \`\`\`
   * ```
   */
  CodeBlock = 512,
  /**
   * An identifier is either a keyword
   * or a variable.
   */
  Identifier = 1028,
  /**
   * The length of the prefix used is passed to the tokenizer
   * after it was determined in the command pipeline. It has
   * to be determined before the message is tokenized to make
   * sure a given message could possibly be a command.
   *
   * A prefix can be any character / characters formatted
   * like it was specified by the prefix configuration.
   *
   * @see {@link IPrefix}
   */
  Prefix = 2056,
  /** Text prefixed with a Dash or DoubleDash is treated as a parameter */
  Parameter = 4112,
  /**
   * Message content that could not be matched with any kind
   * @example
   * `!ban @BeepBoop being too cute 24`
   * Would would result in:
   * `!`          - Prefix,
   * `ban`        - Command,
   * `@BeepBoop`  - UserMention,
   * `being`      - Generic
   * `too`        - Generic
   * `cute`       - Generic,
   * `24`         - Number
   *
   * If the matched command accepts less arguments than
   * the amount of parsed arguments and contains generic arguments
   * Watson will try to figure out the correct argument by
   * adding a parsed argument following or preceding a generic back
   * to its original.
   */
  Generic = 8224,
  /** A dash for command arguments - '-' */
  Dash = 16448,
  /** A double dash for command arguments - '--' */
  DashDash = 32896,
  /** A new line character - '\n', '\r', or '\r\n' */
  NewLine = 65792,
  /** A white space character - '\w', ' ', or '\w+' */
  WhiteSpace = 131584,
  /** End of the message */
  Eom = 263168,
}

export type StringLikeToken =
  | GenericToken
  | StringExpandableToken
  | StringLiteralToken
  | StringTemplateToken;

export interface CommandToken extends Token<CommandTokenKind> {}

export interface TokenWithValue<T = any> extends CommandToken {
  value: T;
}

/** @see {@link CommandTokenKind#Prefix} */
export interface PrefixToken extends CommandToken {}

/** @see {@link CommandTokenKind#UserMention} */
export interface UserMentionToken extends TokenWithValue<string> {
  getId(): string;
  getUser(adapter: DiscordAdapter): Promise<User>;
}
/** @see {@link CommandTokenKind#ChannelMention} */
export interface ChannelMentionToken extends TokenWithValue<string> {
  getId(): string;
  getChannel(adapter: DiscordAdapter): Promise<Channel>;
}
/** @see {@link CommandTokenKind#RoleMention} */
export interface RoleMentionToken extends TokenWithValue<string> {
  getId(): string;
  getRole(guild: Guild): Promise<Role>;
}
/** @see {@link CommandTokenKind#Emote} */
export interface EmoteToken extends TokenWithValue<string> {
  getId(): string;
  getEmote(adapter: DiscordAdapter): Emoji;
}

/** @see {@link CommandTokenKind#CodeBlock} */
export interface CodeBlockToken extends TokenWithValue<string> {
  language: string;
}

/** @see {@link CommandTokenKind#StringExpandable} */
export interface StringExpandableToken extends TokenWithValue<string> {}
/** @see {@link CommandTokenKind#StringLiteral} */
export interface StringLiteralToken extends TokenWithValue<string> {}
/** @see {@link CommandTokenKind#StringTemplate} */
export interface StringTemplateToken extends TokenWithValue<string> {}
/** @see {@link CommandTokenKind#Number} */
export interface NumberToken extends TokenWithValue<number> {}

/** @see {@link CommandTokenKind#Generic} */
export interface GenericToken extends CommandToken {}

// TODO: Allow variables and keywords in template / expandable strings
/** @see {@link CommandTokenKind#Identifier} */
export interface IdentifierToken extends TokenWithValue<string> {}

/** @see {@link CommandTokenKind#Parameter} */
export interface ParameterToken extends TokenWithValue<string> {
  doubleDashed: boolean;
}

/**
 * The following token types are not generated by the
 * default tokenizer.
 */

/** @see {@link CommandTokenKind#NewLine} */
export interface NewLineToken extends CommandToken {}
/** @see {@link CommandTokenKind#WhiteSpace} */
export interface WhiteSpaceToken extends CommandToken {}
/** @see {@link CommandTokenKind#EOM} */
export interface EndOfMessageToken extends CommandToken {}
/** @see {@link CommandTokenKind#Dash} */
export interface DashToken extends CommandToken {}
/** @see {@link CommandTokenKind#DashDash} */
export interface DashDashToken extends CommandToken {}
