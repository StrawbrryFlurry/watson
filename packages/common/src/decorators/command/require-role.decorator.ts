import { COMMAND_PERMISSION_METADATA } from '../../constants';
import { IBasePermissionMetadata } from '../interfaces';

export interface IRequireRoleOptions {
  allRequired?: boolean;
  isID?: boolean;
}

export interface IRequireRoleMetadata
  extends IBasePermissionMetadata,
    IRequireRoleOptions {
  roles: string[];
}

export function RequireRole(role: string): MethodDecorator;
export function RequireRole(roles: string[]): MethodDecorator;
export function RequireRole(
  roles: string | string[],
  options?: IRequireRoleOptions
): MethodDecorator;
export function RequireRole(
  roles: string | string[],
  options?: IRequireRoleOptions
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const existing =
      Reflect.getMetadata(COMMAND_PERMISSION_METADATA, descriptor.value) || [];

    const rolesArray = Array.isArray(roles) ? roles : [roles];

    const metadata: IRequireRoleMetadata = {
      type: "role",
      roles: rolesArray,
      allRequired: !!options?.allRequired,
      isID: options?.isID,
    };

    Reflect.defineMetadata(
      COMMAND_PERMISSION_METADATA,
      [...existing, metadata],
      descriptor.value
    );
  };
}
