import { ParameterType } from '@common/decorators';

import { CommandParameterType } from './parameter-type.enum';

@ParameterType(CommandParameterType.Number)
export abstract class ANumber extends Number {}

@ParameterType(CommandParameterType.Number)
export abstract class AInteger extends Number {}
