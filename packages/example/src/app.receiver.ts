import { Command, Event, InjectChannel, Receiver, WatsonPaginator } from '@watsonjs/common';
import { MessageEmbed, TextChannel } from 'discord.js';

@Receiver({
  prefix: "!",
})
export class AppReceiver {
  @Command()
  async help(@InjectChannel() channel: TextChannel) {
    const message1 = new MessageEmbed({
      title: "Help page 1",
      description: "Some help",
    });

    const message2 = new MessageEmbed({
      title: "Help page 2",
      description: "Some more help",
    });

    const message3 = new MessageEmbed({
      title: "Help page 3",
      description: "Even more help",
    });

    const paginator = new WatsonPaginator([message1, message2, message3], {
      timeReactive: 20000,
      delete: true,
    });

    await paginator.send(channel);
  }

  @Event("message")
  async handleEvent() {
    console.log("Hey");
  }

  @Event("message")
  async handleeEvent() {
    console.log("Hey");
  }
}
