import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';
import { DateTime, DateTimeOptions } from 'luxon';

export interface DateParameterOptions {
  format?: string;
  options?: DateTimeOptions;
}

@ParameterType(CommandParameterType.Date)
export abstract class ADate extends DateTime {}
