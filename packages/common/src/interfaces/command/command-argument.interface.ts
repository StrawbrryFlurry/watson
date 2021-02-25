import { ICommandParam } from '../../decorators';
import { CommandArgumentType } from '../../enums';

export interface CommandArgument<T = any> extends ICommandParam {
  name: string;
  label?: string;
  type?: CommandArgumentType;
  optional?: boolean;
  hungry?: boolean;
  default?: any;
  dateFormat?: string;
  promt?: string;
  choices?: string[];
  isResolved: boolean;
  isNamed: boolean;
  namedParamContent: string;
  content: string;
  value: T;
}
