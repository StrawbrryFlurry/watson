import { WatsonFactory } from '@watson/core';
import { config } from 'dotenv';

import { ApplicationModule } from './app.module';

const bootstrap = async () => {
  const {
    parsed: { DISCORD_TOKEN: token },
  } = config({
    path: __dirname + "/../.env",
  }) as any;

  const app = await WatsonFactory.create(ApplicationModule, {
    discordAuthToken: token,
  });

  app.addGlobalPrefix("!");

  app.setActivity({
    name: "doing stuff",
    type: "PLAYING",
  });

  app.start().then((res) => console.log("started"));
};

bootstrap();
