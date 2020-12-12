<p align="center">
<img src="https://raw.githubusercontent.com/M1CH3L1US/Watson/master/.github/assets/logo.png" width="250">
</p>
 <p align="center">A scalable <a href="https://nodejs.org">Node.js</a> framework for building <a href="https://discord.com">Discord</a> Bots</p>

# Description

Watson is a Discord bot framework heavily inspired by the architecture of <a href="https://github.com/nestjs/nest">NestJS</a> and <a href="https://github.com/angular/angular">Angular</a>. It uses TypeScript to provide an easy to use API to scale along with the growth and complexity of your service.

As an interface to the Discord API we use <a href="https://discord.js.org">DiscordJS</a> though we also plan to support other client frameworks in the future.

## Documentation

These docs are temporary and will be moved to the official website, once the first build is released.

# Usage

If you already have any experience using either Angular or NestJS this will feel very familiar to you. We're going to start off by creating our root module, which by convention is called AppModule or ApplicationModule. For this create a `app.moodule.ts` file in your project directory.

```TS
// app.module.ts
@Module({
  imports: [ ],
  exports: [ ],
  receivers: [ ],
  providers: [ ]
})
export class AppModule {}
```

This new Module can be used create a new Watson Application class. To do this create a new file to start your application. This could either be `main.ts`, `index.ts` or some other name of your choice.

Im this file we're going to bootsrap the application:

```TS
// main.ts
import { WatsonApplicationFactory } from '@watson/core';
import { ApplicationModule } from './app.module';

const bootstrap = async () => {
  const bot = await WatsonApplicationFactory.create(ApplicationModule, {
    discordAuthToken: "My Discord Bot token",
  });

  bot.start()
    .then(
      () => console.log("The bot is now running!")
    );
};

bootstrap();
```

Great job! Your bot can now be started by running your entrypoint file. At this point this wont do much though. To add some functionality to our bot we need to add a `Receiver` to the application.

## Receiver

To add a `Receiver` to your app start by creating a new file using the extension `.receiver.ts`. In this file we're going to implement our first `Receiver`. While at it we're also going to create a file for a service that will handle all our logic for the commands using the extension `.service.ts`.

```TS
// hat.receiver.ts
@Receiver('hat')
export class HatReceiver {
  constructor(private readonly hatService: HatService) {  }

  @Command()
  hatCommand() {
    const hat = this.hatService.getHat();

    return hat.name;
  }

  @Event()
  hatEvent() {  }
}
```

```TS
// hat.service.ts
@Injectable()
export class HatService {
  public getHat() {
    return new class Hat {
      name = 'Watsons Hat';
    }
  }
}
```

Both the `Service` and the `Receiver` have then to be registered in either the `AppModule` or one of its underlying imports.

```TS
// app.module.ts
import { HatService } from './hat.service';
import { HatReceiver } from './hat.receiver';

@Module({
  imports: [ ],
  exports: [ ],
  receivers: [ HatReceiver ],
  providers: [ HatService ]
})
```

# TODOs

- Custom providers
- Dynamic Modules
