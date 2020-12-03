import 'reflect-metadata';

import { config } from 'dotenv';

import { DiscordBotFactory } from './lib';

const bootstrap = async () => {
  const { error, parsed } = config({ path: "./src/.env" });

  if (error) {
    throw new Error("An error occured while parsing the environment file");
  }

  if (!parsed!["DJS_TOKEN"]) {
    throw new Error(
      "Please add DJS_TOKEN with your Discord bot token to your .env file"
    );
  }

  const bot = new DiscordBotFactory({
    token: parsed!["DJS_TOKEN"],
  });

  await bot.start();
};

bootstrap();
