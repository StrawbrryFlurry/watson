import { ChannelArgument } from './channel.argument';
import { RoleArgument } from './role.argument';
import { TextArgument } from './text.argument';
import { UserArgument } from './user.argument';

const INTERNAL_PARAMETER_TYPES = [
  ChannelArgument,
  RoleArgument,
  UserArgument,
  TextArgument,
];

export function isInternalParameterType(parameterType: Object): boolean {
  return INTERNAL_PARAMETER_TYPES.some((type) => parameterType instanceof type);
}
