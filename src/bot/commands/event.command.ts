import { Message } from 'discord.js';

import { BotEvent, Event } from '../../lib';

@BotEvent()
export class EventCommand {
  @Event({ event: "message" })
  handleSomeEvent(message: Message) {
    message.react("🎈");
  }
}
