import { PermissionString } from 'discord.js';

import { createRestrictionDecorator } from '.';

export interface IRestrictPermissionOptions {
  /**
   * Will require the user to have all permissions in the list
   */
  allRequired: boolean;
}

/**
 * Adds required permissions the user needs to have to use this command
 * @param permission Discord permission string
 * @param options configurable options for permissions
 */
export function RestrictPermission(
  permission: PermissionString
): MethodDecorator;
export function RestrictPermission(
  permissions: PermissionString[]
): MethodDecorator;
export function RestrictPermission(
  permissions: PermissionString | PermissionString[],
  options: IRestrictPermissionOptions
): MethodDecorator;
export function RestrictPermission(
  permissions: PermissionString | PermissionString[],
  options?: IRestrictPermissionOptions
): MethodDecorator {
  return createRestrictionDecorator("permission", permissions, options);
}
