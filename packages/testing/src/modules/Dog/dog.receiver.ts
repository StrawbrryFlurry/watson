import { Command, CommandArgumentType, Inject, Param, Receiver, User } from '@watson/common';

@Receiver({
  prefix: "!",
})
export class DogReceiver {
  constructor(@Inject("CUSTOM") private custom: any) {}

  @Command({
    command: "bark",
    alias: ["woofies", "barkies"],
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
  woof(@User() user, @Param() param) {
    console.log(this.custom);
    return "Hey";
    //  this.http.get("https://google.ch").subscribe((e) => console.log(e));
  }
}
