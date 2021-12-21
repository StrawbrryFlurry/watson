/** @Metadata */

export const EVENT_METADATA = "event:meta";

export const SLASH_COMMAND_METADATA = "slash-command:meta";
export const SLASH_COMMAND_GROUP_METADATA = "slash-command-group:meta";
export const APPLICATION_COMMAND_METADATA = "application-command:meta";

export const SUB_COMMAND_METADATA = "sub-command:meta";
export const COMMAND_METADATA = "command:meta";

export const PARAM_METADATA = "param:meta";

export const COOLDOWN_METADATA = "cooldown:meta";
export const PREFIX_METADATA = "prefix:meta";

export const PIPE_METADATA = "pipe:meta";
export const GUARD_METADATA = "guard:meta";
export const FILTER_METADATA = "filter:meta";
export const EXCEPTION_HANDLER_METADATA = "exception-handler:meta";

export const INTERCEPTOR_METADATA = "interceptor:meta";

export const UNICODE_EMOJI_REGEX =
  /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/;

export const USER_MENTION_REGEXP = /^<@\d+>$/;
export const CHANNEL_MENTION_REGEXP = /^<#\d+>$/;
export const ROLE_MENTION_REGEXP = /^<@&\d+>$/;
