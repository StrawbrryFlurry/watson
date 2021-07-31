import { ConfigModule, Module } from "@watsonjs/common";

import { AppReceiver } from "./app.receiver";
import { AppService } from "./app.service";
import { ConfigurablesExampleModule } from "./modules";
import { ExceptionsModule } from "./modules/exceptions/exception.module";
import { InquirableExampleModule } from "./modules/inquirables/inquirable-example.module";
import { ProviderExampleModule } from "./modules/providers/provider-example.module";

@Module({
  imports: [
    ProviderExampleModule,
    InquirableExampleModule,
    ConfigurablesExampleModule,
    ExceptionsModule,
    ConfigModule.forConfig({
      dotEnv: {
        path: `${__dirname}/../.env`,
      },
      global: true,
    }),
  ],
  providers: [AppService],
  receivers: [AppReceiver],
})
export class ApplicationModule {}
