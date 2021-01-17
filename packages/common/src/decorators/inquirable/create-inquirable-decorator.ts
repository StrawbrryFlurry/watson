import { InquirableType, RouteParamType } from '../../enums';
import { createParamDecorator } from '../create-param-decorator';
import { IInquirableMetadata } from './interfaces/inquirable-metadata.interface';

export function createInquirableDecorator(
  type: InquirableType
): ParameterDecorator {
  const payload: IInquirableMetadata = {
    type: type,
  };

  return createParamDecorator(RouteParamType.INQUIRABLE, payload);
}
