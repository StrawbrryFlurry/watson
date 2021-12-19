import { Injector } from '@core/di';
import { BaseRoute, Injectable } from '@watsonjs/common';
import { MessageComponentInteraction } from 'discord.js';

export type MessageComponentCallbackFn = (
  interaction: MessageComponentInteraction
) => void;

export interface MessageComponentCallbackHandler {
  route: BaseRoute;
  callbackFn: MessageComponentCallbackFn;
}

@Injectable({ providedIn: "root" })
export class ComponentInteractionHandler {
  private _componentCallbackCache = new Map<
    /* CustomID of the component */ string,
    MessageComponentCallbackHandler
  >();

  constructor(private _injector: Injector) {}

  public handle(interaction: MessageComponentInteraction) {}
}
