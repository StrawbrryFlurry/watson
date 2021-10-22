import { CommandParameterType } from '@common/interfaces';
import { DateTime, DateTimeOptions } from 'luxon';
import { W_PARAM_TYPE } from 'packages/common/src';

export interface DateParameterOptions {
  format?: string;
  options?: DateTimeOptions;
}

export abstract class ADate extends DateTime {
  static [W_PARAM_TYPE] = CommandParameterType.Date;
}
