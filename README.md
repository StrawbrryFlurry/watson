# Usage

Use the provided index.ts file as a point of reference on how to create a new app.

```TS
// Import the BotFactory and reflect-metadata which bot are required.
import 'reflect-metadata';
import { DiscordBotFactory } from './lib';

const bootstrap = async () => {
  // Create a new Instance of the DiscordBot;
  const bot = new DiscordBotFactory({
    token: "My Token",
  });

  await bot.start().catch(err => console.log("Whoops something yiksed"));
};

bootstrap();
```

## Registering command files to the bot

To get started with adding new commands to your bot you first need to check the `config.json` file that should be present inside the `src` folder. In here you can define folder paths in which the app should look for your files.

```JSON
{
  "commands": ["dist/bot/commands/*.command.js"]
}
```

In the example above it will scan the ./dist/bot/commands folder for files that end with command.js. To use this with the TypeScript compiler you just need to name your files in the ./src/bot/commands folder according to this.

```
- src
  | bot
    | commands
      - my.command.ts
```

In your new command file you need to declare a new class using the @BotCommand decorator. The class name doesn't matter in this case.

```TS
import { Message } from 'discord.js';
import { BotCommand, Command } from '../../lib';

@BotCommand()
export class TestCommand {  }
```

Using this class we can then add new commands to out bot. If you don't have a global prefix defined you'll need to specify one as an argument in the `BotCommand` decorator.

## Adding command handles

We can now finally start with adding some fancy new commands for out bot to handle. To do this we need to create a method inside the class we've just created. You'll need to decorate this method as well. This time using the `Command` decorator. It let's you specify the command name that should trigger the method when a user uses it in channel. You can also specify an array of channels that the command works in and an array of arguments that it supports.

```TS
import { BotCommand, Command } from '../../lib';
import { IncommingMessage } from '../../lib/commands/IncommingMessage';

@BotCommand({ prefix: "!" })
export class EventCommand {
  @Command({ name: "foo" })
  someCommand(message: IncommingMessage) {
    message.message.react("❤");
  }
}
```

The example above will register a new command `!foo` that works in all channels. All `@Command` methods are called with the message argument that is of type `IncommingMessage`. In future builds it should also give you the option to grab arguments directly from the command and maybe some other neat things.

# Running the bot in dev

To run the bot in dev mode use `npm run compile`

# Running the bot in prod

To run the bot in prod mode first use the TypeScript compiler to compile all files to JavaScript. Then update the config file to match your new file structure. After that run the bot with `node ./index.js`.

# TODO

- Update Documentation
- Clean up code
- Add global dependency injection
- Add parameter injection for BotClasses
- Command argument injection with @Arg('NAME')
- Add Modules
- Add easier multi server support
- Add Constructor injection for the DJS Client
- Integration with NestJS
