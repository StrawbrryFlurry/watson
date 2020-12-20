import { COMMAND_PERMISSION_METADATA } from '../../constants';
import { IBasePermissionMetadata } from '../interfaces';

export interface IRequireRoleMetadata extends IBasePermissionMetadata {
  roles: string[];
}

export function RequireRole(role: string): MethodDecorator;
export function RequireRole(roles: string[]): MethodDecorator;
export function RequireRole(roles: string | string[]): MethodDecorator {
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
    };

    Reflect.defineMetadata(
      COMMAND_PERMISSION_METADATA,
      [...existing, metadata],
      descriptor.value
    );
  };
}
