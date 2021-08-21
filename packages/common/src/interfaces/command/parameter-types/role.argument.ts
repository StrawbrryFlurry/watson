import { Role } from 'discord.js';

/**
 * A role mentioned by a member using '@'
 * ```
 * !members @everyone
 * !members @admin
 * !members @moderator
 * ```
 */
export class RoleArgument extends Role {}
