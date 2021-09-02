import { Emoji, Role, TextChannel, User } from 'discord.js';

/** Text channel mentioned by a member using'#'
 * ```
 * #general
 * #welcome
 * #music
 * ```
 */
export abstract class AChannel extends TextChannel {}

/**
 * A role mentioned by a member using '@'
 * ```
 * !members @everyone
 * !members @admin
 * !members @moderator
 * ```
 */
export abstract class ARole extends Role {}

/**
 * A user mentioned by using '@'
 * ```
 * !ban @Michael
 * !ban @User
 * ```
 */
export abstract class AUser extends User {}

/**
 * An emote
 * ```
 * !add emote :pepega:
 * ```
 */
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
export abstract class ACodeBlock implements CodeBlock {
  code: string;
  raw: string;
  language: string;
}
