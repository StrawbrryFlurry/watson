import { createParamDecorator } from 'decorators/create-param-decorator';
import { InquirableType, RouteParamType } from 'enums';

import { IInquirableMetadata } from './interfaces/inquirable-metadata.interface';

export function createInquirableDecorator(
  type: InquirableType
): ParameterDecorator {
  const payload: IInquirableMetadata = {
    type: type,
  };

  return createParamDecorator(RouteParamType.INQUIRABLE, payload);
}
