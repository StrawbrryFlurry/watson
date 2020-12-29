import { ClientEvents } from 'discord.js';

import { EventProxy } from './event-proxy';

export class CommandEventProxy<
  Event extends keyof ClientEvents
> extends EventProxy<Event> {
  public async proxy(...eventData: ClientEvents[Event]) {}
}
