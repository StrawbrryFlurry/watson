import { InjectAsk, InjectChannel, Receiver } from '@watsonjs/common';
import { Message, TextChannel } from 'discord.js';

@Receiver()
export class AskInquirableReceiver {
  @core/command("askping")
  async askCommand(
    @InjectAsk() ask: AskFunction<Message>,
    @InjectChannel() channel: TextChannel
  ) {
    const response = await ask("Would you like me to reply with `pong`?");

    if (response === undefined) {
      return channel.send("Sorry, you didn't respond in time");
    }

    if (response.content === "Yes") {
      return response.channel.send("pong");
    }

    return channel.send("Okay");
  }
}
