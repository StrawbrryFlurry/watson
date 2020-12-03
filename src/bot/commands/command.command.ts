import { BotCommand, Command } from '../../lib';
import { IncommingMessage } from '../../lib/commands/IncommingMessage';

@BotCommand({ prefix: "!" })
export class EventCommand {
  @Command({ name: "foo" })
  someCommand(message: IncommingMessage) {
    message.message.react("");
  }
}
