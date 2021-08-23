import {
  ChannelMentionToken,
  CodeBlockToken,
  CommandTokenKind,
  DashDashToken,
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
  UserMentionToken,
  WhiteSpaceToken,
} from '@watsonjs/common';

export const isGenericToken = (token: Token): token is GenericToken =>
  token.kind === CommandTokenKind.Generic;
export const isChannelMentionToken = (
  token: Token
): token is ChannelMentionToken =>
  token.kind === CommandTokenKind.ChannelMention;
export const isCodeBlockToken = (token: Token): token is CodeBlockToken =>
  token.kind === CommandTokenKind.CodeBlock;
export const isDashToken = (token: Token): token is DashToken =>
  token.kind === CommandTokenKind.Dash;
export const isDashDashToken = (token: Token): token is DashDashToken =>
  token.kind === CommandTokenKind.DashDash;
export const isEmoteToken = (token: Token): token is EmoteToken =>
  token.kind === CommandTokenKind.Emote;
export const isEomToken = (token: Token): token is EndOfMessageToken =>
  token.kind === CommandTokenKind.Eom;
export const isdentifierToken = (token: Token): token is IdentifierToken =>
  token.kind === CommandTokenKind.Identifier;
export const isNewLineToken = (token: Token): token is NewLineToken =>
  token.kind === CommandTokenKind.NewLine;
export const isNumberToken = (token: Token): token is NumberToken =>
  token.kind === CommandTokenKind.Number;
export const isParameterToken = (token: Token): token is ParameterToken =>
  token.kind === CommandTokenKind.Parameter;
export const isPrefixToken = (token: Token): token is PrefixToken =>
  token.kind === CommandTokenKind.Prefix;
export const isRoleMentionToken = (token: Token): token is RoleMentionToken =>
  token.kind === CommandTokenKind.RoleMention;
export const isWhiteSpaceToken = (token: Token): token is WhiteSpaceToken =>
  token.kind === CommandTokenKind.WhiteSpace;
export const isUserMentionToken = (token: Token): token is UserMentionToken =>
  token.kind === CommandTokenKind.UserMention;
export const isStringTemplateToken = (
  token: Token
): token is StringTemplateToken =>
  token.kind === CommandTokenKind.StringTemplate;
export const isStringLiteralToken = (
  token: Token
): token is StringLiteralToken => token.kind === CommandTokenKind.StringLiteral;
export const isStringExpandableToken = (
  token: Token
): token is StringExpandableToken =>
  token.kind === CommandTokenKind.StringExpandable;
