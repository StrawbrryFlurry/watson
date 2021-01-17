import { CollectorOptions, MessageEmbed } from 'discord.js';

import { InquirableType } from '../../enums';
import { createInquirableDecorator } from './create-inquirable-decorator';

/**
 * @param message The message that should be sent to the channel.
 * @param filter The filter for the collector.
 * @param type The collector type.
 * @param options Options for the collector.
 * @returns A `Promise` that resolves to the collector result as an `array`.
 */
export type CollectFunction<T = any> = (
  message: string | MessageEmbed,
  filter: (...args: unknown[]) => boolean,
  type: "message" | "reaction",
  options?: CollectorOptions
) => Promise<T>;

/**
 * Injects the `collect` function to the command handler.
 */
export function Collect() {
  return createInquirableDecorator(InquirableType.COLLECT);
}
