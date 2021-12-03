import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { W_PARAM_TYPE } from '@common/fields';
import { DateTime, DateTimeOptions } from 'luxon';

export interface DateParameterOptions {
  format?: string;
  options?: DateTimeOptions;
}

export abstract class ADate extends DateTime {
  static [W_PARAM_TYPE] = CommandParameterType.Date;
}
