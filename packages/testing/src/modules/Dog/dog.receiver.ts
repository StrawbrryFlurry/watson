import { Command, CommandArgumentType, Param, Receiver, User } from '@watson/common';

@Receiver({
  prefix: "!",
})
export class DogReceiver {
  //  constructor(private http: HttpClient) {}

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
    return "Hey";
    //  this.http.get("https://google.ch").subscribe((e) => console.log(e));
  }
}
