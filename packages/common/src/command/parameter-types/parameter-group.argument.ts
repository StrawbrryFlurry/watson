import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { SlashCommandParameterOptions } from '@common/decorators/application';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';

/**
 * A parameter group can be used to bind multiple
 * parameters to an interaction using only a single
 * parameter declaration in your command handler. That way,
 * if you have commonly used arguments that are used for a
 * certain type, you can use this type to group them into
 * a single argument.
 *
 * Take a timestamp for example. You want to collect
 * hours and minutes for some of your commands. If
 * you don't want to repeat yourself writing two
 * parameters for each, do this instead:
 *
 * @example
 * ```ts
 * class DateTimeParameterGroup extends ParameterGroup<{
 *   minutes: typeof Number;
 *   hours: typeof Number;
 * }> {
 *   public parameters() {
 *     return {
 *       minutes: Number,
 *       hours: Number,
 *     };
 *   }
 * }
 * ```
 * ---
 * ```ts
 * class SomeRouter {
 *   @SlashCommand({ name: "time", description: "Gib time" })
 *   gimmeTime(minutesAndHours: DateTimeParameterGroup) {
 *     const { minutes, hours } = minutesAndHours.arguments;
 *   }
 * }
 * ```
 */

@ParameterType(CommandParameterType.Group)
export abstract class ParameterGroup<
  P extends { [key: string]: SlashCommandParameterOptions | object },
  T = {
    [K in keyof P]: P[K] extends SlashCommandParameterOptions
      ? P[K]["type"]
      : P[K];
  }
> {
  public arguments!: T;
  public abstract parameters(): P;
}
