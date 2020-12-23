import { PermissionString } from 'discord.js';

export interface IRestrictionPayloadMap {
  role: string[];
  permission: PermissionString[];
  channel: string[];
}

export interface IRestrictionOptionsMap {
  role: undefined;
  permission: {
    allRequired: boolean;
  };
  channel: {
    isId: boolean;
  };
}

export interface ICommandRestrictionMetadata<
  T extends keyof IRestrictionPayloadMap
> {
  type: T;
  payload: IRestrictionPayloadMap[T];
  options: IRestrictionOptionsMap[T];
}
