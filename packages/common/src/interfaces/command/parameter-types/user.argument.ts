import { User } from 'discord.js';

/**
 * A member mentioned by a member using '@'
 * ```
 * !ban @Michael
 * !ban @User
 * ```
 */
export class UserArgument extends User {}
