import { EmbedFieldData } from 'discord.js';

import { createBaseError } from './create-error';
import { IErrorOptions } from './error-host';

export interface IUnauthorizedErrorOptions extends IErrorOptions {}

export const UNAUTHORIZED_ERROR = (options: IUnauthorizedErrorOptions) => {
  const title = "Unauthorized exception";
  const description = `You are not authorized to use the command ${options.route.name}`;

  const message = createBaseError(options, title, description);
  const fields: EmbedFieldData[] = [];

  const roles = options.route.requiredRoles;
  const permissions = options.route.requiredPermissions;

  let roleNames = undefined;
  let permissionNames = undefined;

  for (const role of roles) {
    roleNames =
      roleNames === undefined ? `${role}\n` : (roleNames += `${role}\n`);
  }

  for (const permission of permissions) {
    permissionNames =
      permissionNames === undefined
        ? `${permission}\n`
        : (permissionNames += `${permission}\n`);
  }

  fields.push(
    {
      name: "Roles required",
      value: roleNames || "none",
    },
    {
      name: "Permissions required",
      value: permissionNames || "none",
    }
  );

  message.addFields(...fields);
  return message;
};
