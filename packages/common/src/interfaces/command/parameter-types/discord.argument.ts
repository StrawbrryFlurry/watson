import { W_PARAM_TYPE } from '@common/fields';
import { CommandParameterType } from '@common/interfaces/command/parameter-types/parameter-type.enum';
import { ExtendReadonlyCtor } from '@common/utils';
import { Emoji, Role, TextChannel, User } from 'discord.js';

/** Text channel mentioned by a member using'#'
 * ```
 * #general
 * #welcome
 * #music
 * ```
 */
export abstract class AChannel extends TextChannel {
  static [W_PARAM_TYPE] = CommandParameterType.Channel;
}

/**
 * A role mentioned by a member using '@'
 * ```
 * !members @everyone
 * !members @admin
 * !members @moderator
 * ```
 */
export abstract class ARole extends ExtendReadonlyCtor(Role) {
  static [W_PARAM_TYPE] = CommandParameterType.Role;
}

/**
 * A user mentioned by using '@'
 * ```
 * !ban @Michael
 * !ban @User
 * ```
 */
export abstract class AUser extends User {
  static [W_PARAM_TYPE] = CommandParameterType.User;
}

/**
 * An emote
 * ```
 * !add emote :pepega:
 * ```
 */
export abstract class AEmote extends Emoji {
  static [W_PARAM_TYPE] = CommandParameterType.Emote;
}

export interface CodeBlock {
  code: string;
  raw: string;
  language: string | null;
}

/**
 * A code block
 * ```
 * \`\`\`ts
 * const Beep = "Some fun ts code";
 * \`\`\`
 * ```
 */
export abstract class ACodeBlock implements CodeBlock {
  code: string;
  raw: string;
  language: string;

  static [W_PARAM_TYPE] = CommandParameterType.CodeBlock;
}
