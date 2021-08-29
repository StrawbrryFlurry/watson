import { InquirableOptions } from '@decorators';

import { InquirableType } from '../../../enums';

export interface InquirableMetadata<T extends InquirableOptions = any> {
  type: InquirableType;
}
