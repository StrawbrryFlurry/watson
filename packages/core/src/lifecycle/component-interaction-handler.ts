import { Injector } from "@core/di";
import { BaseRoute, Injectable, isNil, PipelineBase } from "@watsonjs/common";
import { MessageComponentInteraction } from "discord.js";

export type MessageComponentCallbackFn = (
  interaction: MessageComponentInteraction,
  cachedHandler: MessageComponentCallbackHandler
) => void;

export interface MessageComponentCallbackHandler {
  routeRef: BaseRoute;
  callbackFn: MessageComponentCallbackFn;
  pipelineRef: PipelineBase;
}

@Injectable({ providedIn: "root" })
export class ComponentInteractionHandler {
  private _componentCallbackCache = new Map<
    /* CustomID of the component */ string,
    MessageComponentCallbackHandler
  >();

  constructor(private _injector: Injector) {}

  /**
   * Binds a message component to the internal
   * cache.
   */
  public bind(
    customId: string,
    routeRef: BaseRoute,
    callbackFn: MessageComponentCallbackFn,
    pipelineRef: PipelineBase
  ) {
    this._componentCallbackCache.set(customId, {
      callbackFn,
      routeRef,
      pipelineRef,
    });
  }

  /**
   * Removes the component with `customId`
   * from the cache.
   */
  public remove(customId: string) {
    this._componentCallbackCache.delete(customId);
  }

  /**
   * Handles a component interaction; calling
   * the callback method defined in the message
   * component.
   */
  public handle(interaction: MessageComponentInteraction) {
    const { customId } = interaction;
    const cached = this._componentCallbackCache.get(customId);

    if (isNil(cached)) {
      return;
    }

    interaction.message;

    const { callbackFn } = cached;
    callbackFn(interaction, cached);
  }
}
