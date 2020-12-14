import { WatsonApplicationFactory } from "@watson/core";

import { ApplicationModule } from "./app.module";
import { TestService } from "./test.service";

const bootstrap = async () => {
  const app = await WatsonApplicationFactory.create(ApplicationModule, {
    discordAuthToken: "Asdjads",
  });

  console.log(app.getProviderInstance(TestService));

  app.start().then((res) => console.log("started"));
};

bootstrap();
