import { ChannelResolvable } from 'discord.js';

import type { BaseCommandParameter } from "@common/decorators";
import type { ChannelType } from "@common/enums";
/**
 * Allow users to pick from a list of max. 25 choices
 * of type string, integer or double
 *
 * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
 */
export interface SlashCommandParameterChoice<T extends string | number> {
  /**
   * 1-100 character choice name
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure)}
   */
  name: string;
  /**
   * Value of the choice, up to 100 characters if it's string.
   * The type of value depends on the option type that the choice
   * belongs to.
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure)}
   */
  value: T;
}

/**
 * Options for a slash command option that has
 * a integer or number type.
 *
 * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
 */
export interface SlashCommandParameterWithMinMax {
  /**
   * The minimum value permitted
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
   */
  minValue?: number;
  /**
   * The maximum value permitted
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
   */
  maxValue?: number;
}

/**
 * Options for a slash command option that has
 * a channel type.
 *
 * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
 */
export interface SlashCommandParameterWithChannelTypes {
  /**
   * Restricts the channels shown for this option
   * to the types specified.
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
   *
   */
  channelTypes?: ChannelType[];
}

export interface SlashCommandParameterWithChoices<
  T extends string | number = any
> {
  /**
   * Allow users to pick from a list of max. 25 choices
   * of type string, integer or double
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
   */
  choices?: SlashCommandParameterChoice<T>[];
}

type DefaultSlashCommandOptions = {
  /**
   * enable autocomplete interactions for this option
   *
   * {@link [See Discord docs](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)}
   */
  autocomplete?: boolean;
};

export type SlashCommandNumberParameterOptions =
  SlashCommandParameterWithMinMax &
    SlashCommandParameterWithChoices<number> &
    BaseCommandParameter<number>;
export type SlashCommandStringParameterOptions =
  SlashCommandParameterWithChoices<string> & BaseCommandParameter<string>;
export type SlashCommandChannelParameterOptions =
  SlashCommandParameterWithChannelTypes &
    BaseCommandParameter<ChannelResolvable>;

export type SlashCommandParameterOptions<T = any> = DefaultSlashCommandOptions &
  (
    | SlashCommandNumberParameterOptions
    | SlashCommandStringParameterOptions
    | SlashCommandChannelParameterOptions
    | BaseCommandParameter<T>
  );
