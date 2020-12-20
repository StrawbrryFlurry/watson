import { PermissionString } from 'discord.js';

import { COMMAND_PERMISSION_METADATA } from '../../constants';
import { IBasePermissionMetadata } from '../interfaces';

export interface IRequirePermissionOptions {
  allRequired: boolean;
}

export interface IRequirePermissionMetadata
  extends IBasePermissionMetadata,
    IRequirePermissionOptions {
  permissions: PermissionString[];
}

export function RequirePermission(
  permission: PermissionString
): MethodDecorator;
export function RequirePermission(
  permissions: PermissionString[]
): MethodDecorator;
export function RequirePermission(
  permissions: PermissionString | PermissionString[],
  options: IRequirePermissionOptions
): MethodDecorator;
export function RequirePermission(
  permissions: PermissionString | PermissionString[],
  options?: IRequirePermissionOptions
): MethodDecorator {
  return (
    target: Object,
    proertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const existing =
      Reflect.getMetadata(COMMAND_PERMISSION_METADATA, descriptor.value) || [];

    const permissionsArray = Array.isArray(permissions)
      ? permissions
      : [permissions];

    const metadata: IRequirePermissionMetadata = {
      type: "permission",
      permissions: permissionsArray,
      allRequired: !!options?.allRequired,
    };

    Reflect.defineMetadata(
      COMMAND_PERMISSION_METADATA,
      [...existing, metadata],
      descriptor.value
    );
  };
}
