import { LifecycleFunction } from '@core/router';
import { CommandRoute, ExceptionHandler, isNil, MessageMatcher, WatsonEvent } from '@watsonjs/common';
import { Message } from 'discord.js';

import { AbstractProxy } from './abstract-proxy';

export class CommandProxy extends AbstractProxy<
  WatsonEvent.COMMAND,
  CommandRoute
> {
  private readonly matcher: MessageMatcher<any>;

  constructor(matcher: MessageMatcher<any>) {
    super(WatsonEvent.COMMAND);
    this.matcher = matcher;
  }

  public async proxy<ProxyData extends [Message] = [Message]>(
    event: ProxyData
  ) {
    const [message] = event;
    let routeRef: CommandRoute;
    let parsed: any;

    /**
     * Matches the message against all mapped
     * command routes.
     * If none could be matched the message will
     * be ignored.
     *
     * If the demand is there to have `command not found`
     * messages this could be updated to specifically
     * catch the `UnknownCommandException`.
     */
    try {
      const a = await this.matcher.match(message);

      if (isNil(a)) {
        return;
      }

      routeRef = a as any;
      parsed = {
        command: a as any,
        prefix: a as any,
      };
    } catch (err) {
      return;
    }

    const [eventHandler, excpetionHandler] = this.handlers.get(routeRef) as any;

    try {
      await eventHandler(routeRef, event, parsed);
    } catch (err) {
      excpetionHandler.handle(err);
    }
  }

  public bind(
    route: CommandRoute,
    handlerFn: LifecycleFunction,
    exceptionHandler: ExceptionHandler
  ): void {
    Reflect.apply(this.bindHandler, this, arguments);
  }
}
