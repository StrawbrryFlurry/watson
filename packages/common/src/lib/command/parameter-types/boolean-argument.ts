import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';

interface BooleanLikeValue {
  name: string;
  value: boolean;
}

export const BOOLEAN_LIKE_VALUES: BooleanLikeValue[] = [
  { name: "true", value: true },
  { name: "false", value: false },
  { name: "yes", value: true },
  { name: "no", value: false },
  { name: "y", value: true },
  { name: "n", value: false },
];

@ParameterType(CommandParameterType.Boolean)
export abstract class ABooleanLike extends Boolean {}
