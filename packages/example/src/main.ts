import { ConfigService } from "@watsonjs/common";
import { WatsonFactory } from "@watsonjs/core";

import { ApplicationModule } from "./app.module";

const bootstrap = async () => {
  const app = await WatsonFactory.create(ApplicationModule);

  const configService = app.getProviderInstance(ConfigService);
  const token = configService.get("DISCORD_TOKEN");

  app.setAuthToken(token);
  app.addGlobalPrefix("!");
  app.setActivity({
    name: "doing stuff",
    type: "PLAYING",
  });

  app.start().then((res) => console.log("started"));
};

bootstrap();
