import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';

/**
 * A valid URL e.g. link.
 * @example
 * https://youtube.com
 */
@ParameterType(CommandParameterType.URL)
export abstract class AUrl extends URL {}
