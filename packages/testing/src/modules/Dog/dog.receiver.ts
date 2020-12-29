import { Command, CommandArgumentType, Param, Receiver, User } from '@watson/common';

@Receiver({
  prefix: "!",
})
export class DogReceiver {
  @Command({
    command: "bark",
    alias: ["woofies", "barkies"],
    params: [
      {
        name: "User",
        type: CommandArgumentType.USER,
        default: "@user",
        encapsulator: "asdas",
      },
    ],
  })
  woof(@User() user, @Param() param) {
    console.log(param);
    console.log(user);
  }
}
