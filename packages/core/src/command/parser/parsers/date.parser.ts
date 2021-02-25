import { BadArgumentException, ICommandParam } from '@watsonjs/common';
import dayjs = require('dayjs');

export class DateMessageTypeParser {
  parseDate(content: string, param: ICommandParam) {
    const { dateFormat } = param;

    const date = dayjs(content, {
      format: dateFormat,
    });

    if (date.isValid()) {
      return date;
    }

    throw new BadArgumentException(param);
  }
}
