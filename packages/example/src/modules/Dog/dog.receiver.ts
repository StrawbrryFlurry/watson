import { Command, CommandArgumentType, Inject, Param, Receiver, User } from '@watson/common';
import { User as DiscordUser } from 'discord.js';

@Receiver({
  prefix: "!",
})
export class DogReceiver {
  constructor(@Inject("CUSTOM") private custom: any) {}

  @Command({
    command: "bark",
    alias: ["woof"],
    params: [
      {
        name: "User",
        type: CommandArgumentType.USER,
        default: "@user",
        optional: true,
        encapsulator: "asdas",
      },
    ],
  })
  woof(@User() user: DiscordUser, @Param() param: string[]) {}
}
