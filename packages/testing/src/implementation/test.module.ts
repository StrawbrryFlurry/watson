import { Module } from "@watson/common";
import { DogService } from "./dog.service";

import { TestReceiver } from "./test.receiver";
import { TestService } from "./test.service";
import { AdditionalTestModule } from "./test2.module";

@Module({
  imports: [AdditionalTestModule],
  providers: [TestService, DogService],
  receivers: [TestReceiver],
})
export class TestModule {}
