import { W_PARAM_TYPE } from '@common/fields';
import { CommandParameterType } from '@common/interfaces/command/parameter-types';
import { DateTime, DateTimeOptions } from 'luxon';

export interface DateParameterOptions {
  format?: string;
  options?: DateTimeOptions;
}

export abstract class ADate extends DateTime {
  static [W_PARAM_TYPE] = CommandParameterType.Date;
}
