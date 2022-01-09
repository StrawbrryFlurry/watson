import { SLASH_COMMAND_GROUP_METADATA, SLASH_COMMAND_METADATA } from '@common/constants';
import { Router } from '@common/decorators/common/router.decorator';
import { And, IsLowerCase, StringHasLength, ValueOrNever } from '@common/utils';

import { ApplicationCommandType } from './application-command.decorator';

export interface SlashCommandOptions<N extends string, D extends string> {
  /**
   * Name under which the command will be available.
   * The name cannot be longer than 32 characters and
   * must be lower-case.
   *
   * @note
   * If you don't meet either of these criteria,
   * you'll get the TypeScript error
   * `Type 'never' has no call signatures.`
   */
  name: N;
  /**
   * A description for the slash command.
   * The description can have a maximum size
   * of 100 characters.
   *
   * @note
   *
   * Due to TypeScript limitations you'll only
   * get a runtime error if you exceed the character
   * limit.
   */
  description: D;
}

export interface SlashCommandMetadata<
  N extends string = string,
  D extends string = string
> extends SlashCommandOptions<N, D> {
  type: ApplicationCommandType;
}

/**
 * Marks the {@link Router} as a slash command group.
 * Every slash command registered in this
 * router will be added as part of the command
 * group instead of being registered by
 * itself.
 */
export function SlashCommandGroup<
  N extends string,
  D extends string,
  R extends ValueOrNever<
    And<[IsLowerCase<N>, StringHasLength<N, 32>]>,
    ClassDecorator
  >
>(options: SlashCommandOptions<N, D>): R {
  return ((target: Object) => {
    const { name, description } = options;

    if (description.length > 100) {
      throw new Error(
        `Property description of SlashCommandGroup ${name} in router ${
          (target as Function).name
        } cannot be longer than 100 characters.`
      );
    }

    Reflect.defineMetadata(SLASH_COMMAND_GROUP_METADATA, options, target);
  }) as R;
}

export function SlashCommand<
  N extends string,
  D extends string,
  R extends ValueOrNever<
    And<[IsLowerCase<N>, StringHasLength<N, 32>]>,
    MethodDecorator
  >
>(options: SlashCommandOptions<N, D>): R {
  return ((
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    const { name, description } = options;

    if (description.length > 100) {
      throw new Error(
        `Property description of SlashCommand ${name} in router ${
          (target as Function).name
        } cannot be longer than 100 characters.`
      );
    }

    Reflect.defineMetadata(SLASH_COMMAND_METADATA, options, descriptor.value);
  }) as R;
}

/** @jsdoc-ref */
declare const _: typeof Router;
