import { Channel, GuildMember, Role } from 'discord.js';

import { Injectable } from '../..';

interface FindInq<T> {
  /**
   * Searches for objects in the current guild context.
   *
   * @param fuzzy Performs a fuzzy / wildcard match.
   *
   * @usage
   * ```js
   * public async getAdminRoles(roleFinder: FindRoleInq) {
   *   const roles = await roleFinder('admin', true);
   *   return roles.map(e => e.name);
   * }
   * ```
   */
  <
    F extends boolean,
    R extends F extends true ? Promise<T[] | null> : Promise<T | null>
  >(
    name: string,
    fuzzy?: F
  ): R;
}

/** Searches for a role in the current guild context. */
export declare interface FindRoleInq extends FindInq<Role> {}

/** Searches for a member in the current guild context. */
export declare interface FindMemberInq extends FindInq<GuildMember> {}

/** Searches for a channel in the current guild context. */
export declare interface FindChannelInq extends FindInq<Channel> {}

/**
 *
 * ---
 * This type is only required to
 * performing type reflection on
 * parameters which use this function.
 * They can be safely ignored and
 * should not be extended.
 */
@Injectable({ providedIn: "ctx" })
export abstract class FindRoleInq {}

/**
 *
 * ---
 * This type is only required to
 * performing type reflection on
 * parameters which use this function.
 * They can be safely ignored and
 * should not be extended.
 */
@Injectable({ providedIn: "ctx" })
export abstract class FindChannelInq {}

/**
 *
 * ---
 * This type is only required to
 * performing type reflection on
 * parameters which use this function.
 * They can be safely ignored and
 * should not be extended.
 */
@Injectable({ providedIn: "ctx" })
export abstract class FindMemberInq {}
