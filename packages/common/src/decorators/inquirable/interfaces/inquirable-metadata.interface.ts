import { InquirableOptions } from '@decorators/inquirable';

import { InquirableType } from '../../../enums';

export interface InquirableMetadata<T extends InquirableOptions = any> {
  type: InquirableType;
}
