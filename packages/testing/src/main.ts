import { WatsonApplicationFactory } from '@watson/core';

import { ApplicationModule } from './modules/app.module';

const bootstrap = async () => {
  const app = await WatsonApplicationFactory.create(ApplicationModule, {
    discordAuthToken: "Asdjads",
  });

  app.start().then((res) => console.log("started"));
};

bootstrap();
