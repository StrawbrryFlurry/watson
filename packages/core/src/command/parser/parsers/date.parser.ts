import { BadArgumentException } from '@watsonjs/common';
import dayjs = require('dayjs');

import { CommandArgumentWrapper } from '../../command-argument-wrapper';

export class DateMessageTypeParser {
  parseDate(content: string, argument: CommandArgumentWrapper) {
    const { dateFormat } = argument;

    const date = dayjs(content, {
      format: dateFormat,
    });

    if (date.isValid()) {
      return date;
    }

    throw new BadArgumentException(argument);
  }
}
