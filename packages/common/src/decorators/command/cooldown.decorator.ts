import { COOLDOWN_METADATA } from '@common/constants';

import { isMethodDecorator, mergeDefaults } from '../..';

/**
 * Defines how a command
 * cooldown is applied
 */
export enum CommandCooldownType {
  /** Applies the cooldown globally */
  Global,
  /** Applies the cooldown on a per-guild basis */
  Guild,
  /** Applies the cooldown on a per-channel basis */
  Channel,
  /** Applies the cooldown on a per-user basis */
  User,
}

export interface CommandCooldownOptions {
  /**
   * The amount of times a command
   * can be used before the cooldown
   * is applied.
   *
   * @default 1;
   */
  maxUses?: number;
  /**
   * Number of seconds
   * the command cannot be used
   * after `maxUses` was reached.
   *
   * @default 5;
   */
  cooldown?: number;
  /**
   * Defines how the cooldown is applied.
   *
   * @default CommandCooldownType.User
   */
  type?: CommandCooldownType;
}

const DEFAULT_COOLDOWN = 5;
const DEFAULT_USES = 1;
const DEFAULT_TYPE = CommandCooldownType.User;

export function UseCooldown(): ClassDecorator | MethodDecorator;
export function UseCooldown(
  options: CommandCooldownOptions
): ClassDecorator | MethodDecorator;
export function UseCooldown(
  options: CommandCooldownOptions = {}
): ClassDecorator | MethodDecorator {
  const metadata = mergeDefaults(options, {
    cooldown: DEFAULT_COOLDOWN,
    maxUses: DEFAULT_USES,
    type: DEFAULT_TYPE,
  });

  return (
    target: Object,
    propertyKey?: string | Symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return Reflect.defineMetadata(
        COOLDOWN_METADATA,
        metadata,
        descriptor!.value
      );
    }

    Reflect.defineMetadata(COOLDOWN_METADATA, metadata, target);
  };
}
