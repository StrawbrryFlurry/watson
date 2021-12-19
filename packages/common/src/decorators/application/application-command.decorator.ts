import { APPLICATION_COMMAND_METADATA } from '@common/constants';
import { StringHasLength, ValueOrNever } from '@common/utils';

export enum ApplicationCommandType {
  Command,
  User,
  Message,
}
type ApplicationCommandTypeWithoutSlashCommands = Omit<
  ApplicationCommandType,
  1
>;

export interface ApplicationCommandMetadata {
  name: string;
  type: ApplicationCommandTypeWithoutSlashCommands;
}

function createApplicationCommand(
  name: string,
  type: ApplicationCommandTypeWithoutSlashCommands
) {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    const metadata: ApplicationCommandMetadata = {
      name,
      type,
    };

    Reflect.defineMetadata(
      APPLICATION_COMMAND_METADATA,
      metadata,
      descriptor.value
    );
  };
}

export function UserMenuCommand<
  S extends string,
  R extends ValueOrNever<StringHasLength<S, 32>, MethodDecorator>
>(
  /**
   * Name under which the command will be available.
   * The name cannot be longer than 32 characters.
   *
   * @note
   * If the name is longer than 32 characters,
   * you'll get the TypeScript error
   * `Type 'never' has no call signatures.`
   */
  name: S
): R {
  return createApplicationCommand(name, ApplicationCommandType.User) as R;
}

export function MessageMenuCommand<
  S extends string,
  R extends ValueOrNever<StringHasLength<S, 32>, MethodDecorator>
>(
  /**
   * Name under which the command will be available.
   * The name cannot be longer than 32 characters.
   *
   * @note
   * If the name is longer than 32 characters,
   * you'll get the TypeScript error
   * `Type 'never' has no call signatures.`
   */
  name: S
): R {
  return createApplicationCommand(name, ApplicationCommandType.Message) as R;
}
