import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';
import { ExtendReadonlyCtor } from '@common/utils';
import { Emoji, Role, TextChannel, User } from 'discord.js';

/** Text channel mentioned by a member using'#'
 * ```
 * #general
 * #welcome
 * #music
 * ```
 */
@ParameterType(CommandParameterType.Channel)
export abstract class AChannel extends TextChannel {}

/**
 * A role mentioned by a member using '@'
 * ```
 * !members @everyone
 * !members @admin
 * !members @moderator
 * ```
 */
@ParameterType(CommandParameterType.Role)
export abstract class ARole extends ExtendReadonlyCtor(Role) {}

/**
 * A user mentioned by using '@'
 * ```
 * !ban @Michael
 * !ban @User
 * ```
 */
@ParameterType(CommandParameterType.User)
export abstract class AUser extends User {}

/**
 * An emote
 * ```
 * !add emote :pepega:
 * ```
 */
@ParameterType(CommandParameterType.Emote)
export abstract class AEmote extends Emoji {}

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
@ParameterType(CommandParameterType.CodeBlock)
export abstract class ACodeBlock implements CodeBlock {
  code!: string;
  raw!: string;
  language!: string;
}
