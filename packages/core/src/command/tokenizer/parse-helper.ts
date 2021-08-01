import {
  CommandTokenKind,
  IChannelMentionToken,
  ICodeBlockToken,
  IDashDashToken,
  IDashToken,
  IEmoteToken,
  IEndOfMessageToken,
  IGenericToken,
  IIdentifierToken,
  INewLineToken,
  INumberToken,
  IParameterToken,
  IPrefixToken,
  IRoleMentionToken,
  IStringExpandableToken,
  IStringLiteralToken,
  IStringTemplateToken,
  IToken,
  IUserMentionToken,
  IWhiteSpaceToken,
} from '@watsonjs/common';

export const isGenericToken = (token: IToken): token is IGenericToken =>
  token.kind === CommandTokenKind.Generic;
export const isChannelMentionToken = (
  token: IToken
): token is IChannelMentionToken =>
  token.kind === CommandTokenKind.ChannelMention;
export const isCodeBlockToken = (token: IToken): token is ICodeBlockToken =>
  token.kind === CommandTokenKind.CodeBlock;
export const isDashToken = (token: IToken): token is IDashToken =>
  token.kind === CommandTokenKind.Dash;
export const isDashDashToken = (token: IToken): token is IDashDashToken =>
  token.kind === CommandTokenKind.DashDash;
export const isEmoteToken = (token: IToken): token is IEmoteToken =>
  token.kind === CommandTokenKind.Emote;
export const isEomToken = (token: IToken): token is IEndOfMessageToken =>
  token.kind === CommandTokenKind.Eom;
export const isIdentifierToken = (token: IToken): token is IIdentifierToken =>
  token.kind === CommandTokenKind.Identifier;
export const isNewLineToken = (token: IToken): token is INewLineToken =>
  token.kind === CommandTokenKind.NewLine;
export const isNumberToken = (token: IToken): token is INumberToken =>
  token.kind === CommandTokenKind.Number;
export const isParameterToken = (token: IToken): token is IParameterToken =>
  token.kind === CommandTokenKind.Parameter;
export const isPrefixToken = (token: IToken): token is IPrefixToken =>
  token.kind === CommandTokenKind.Prefix;
export const isRoleMentionToken = (token: IToken): token is IRoleMentionToken =>
  token.kind === CommandTokenKind.RoleMention;
export const isWhiteSpaceToken = (token: IToken): token is IWhiteSpaceToken =>
  token.kind === CommandTokenKind.WhiteSpace;
export const isUserMentionToken = (token: IToken): token is IUserMentionToken =>
  token.kind === CommandTokenKind.UserMention;
export const isStringTemplateToken = (
  token: IToken
): token is IStringTemplateToken =>
  token.kind === CommandTokenKind.StringTemplate;
export const isStringLiteralToken = (
  token: IToken
): token is IStringLiteralToken =>
  token.kind === CommandTokenKind.StringLiteral;
export const isStringExpandableToken = (
  token: IToken
): token is IStringExpandableToken =>
  token.kind === CommandTokenKind.StringExpandable;
