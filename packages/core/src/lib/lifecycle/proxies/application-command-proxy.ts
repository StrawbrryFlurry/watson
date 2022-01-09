import { LifecycleFunction } from '@core/router';
import { ApplicationCommandRoute, BaseRoute, WatsonEvent } from '@watsonjs/common';
import { Injector } from '@watsonjs/di';
import { Interaction } from 'discord.js';

import { AbstractProxy } from './abstract-proxy';

export class ApplicationCommandProxy extends AbstractProxy<
  WatsonEvent.INTERACTION_CREATE,
  ApplicationCommandRoute,
  Interaction
> {
  constructor(injector: Injector) {
    super(WatsonEvent.INTERACTION_CREATE);
  }

  public proxy(interaction: Interaction): Promise<void> {
    /**
     * Needs to be handled fist as the
     * user expects real-time feedback
     * as he's typing.
     */
    if (interaction.isAutocomplete()) {
      // User is trying to autocomplete
    }

    if (interaction.isMessageComponent()) {
      interaction;

      // Handle existing message component listeners
    }

    if (interaction.isApplicationCommand()) {
      const { commandId } = interaction;
    }

    throw new Error("Method not implemented.");
  }

  public bind(route: BaseRoute, eventHandler: LifecycleFunction): void {
    Reflect.apply(this.bindHandler, this, arguments);
  }
}
