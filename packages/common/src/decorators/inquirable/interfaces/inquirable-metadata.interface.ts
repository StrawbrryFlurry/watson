import { InquirableType } from 'enums';

import { IInquirableOptions } from './inquirable-options.interface';

export interface IInquirableMetadata<T extends IInquirableOptions = any> {
  type: InquirableType;
}
