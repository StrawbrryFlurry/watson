import { InquirableType, RouteParamType } from '../../enums';
import { createParamDecorator } from '../create-param-decorator';
import { InquirableMetadata } from './interfaces/inquirable-metadata.interface';

export function createInquirableDecorator(
  type: InquirableType
): ParameterDecorator {
  const payload: InquirableMetadata = {
    type: type,
  };

  return createParamDecorator(RouteParamType.INQUIRABLE, payload);
}
