import { CommandException } from './command.exception';

export type IPermissionCheckType = "Role" | "Permission" | "Channel";

export class UnatuhorizedException extends CommandException {
  public type: IPermissionCheckType;

  constructor(type: IPermissionCheckType) {
    super();
    this.type = type;
  }
}
