import { LifecycleFunction } from '@core/router';
import { CommandRoute, isNil, MessageMatcher, WatsonEvent } from '@watsonjs/common';
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

    const eventHandler = this.handlers.get(routeRef)!;

    try {
      await eventHandler(routeRef, event, parsed);
    } catch (err) {
      const exceptionHandler = await this.getExceptionHandler(routeRef);
      exceptionHandler.handle(<Error>err);
    }
  }

  public bind(route: CommandRoute, handlerFn: LifecycleFunction): void {
    Reflect.apply(this.bindHandler, this, arguments);
  }
}
