import { DateTime, DateTimeOptions } from 'luxon';

export interface DateParameterOptions {
  format?: string;
  options?: DateTimeOptions;
}

export abstract class ADate extends DateTime {}
