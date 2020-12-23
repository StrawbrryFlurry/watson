import { createRestrictionDecorator } from './';

export function RestrictRole(role: string): MethodDecorator;
export function RestrictRole(roles: string[]): MethodDecorator;
export function RestrictRole(roles: string | string[]): MethodDecorator {
  return createRestrictionDecorator("role", roles);
}
