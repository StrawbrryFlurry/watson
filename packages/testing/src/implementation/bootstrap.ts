import { WatsonApplicationFactory } from '@watson/core';

import { ApplicationModule } from './app.module';

const bootstrap = async () => {
  const watson = await WatsonApplicationFactory.create(ApplicationModule, {
    discordAuthToken: "Asdjads",
  });

  watson.start().then((res) => console.log(res));
};

bootstrap();
