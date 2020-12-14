import { Module } from "@watson/common";
import { DogService } from "./dog.service";

import { TestModule } from "./test.module";

@Module({
  imports: [TestModule],
})
export class ApplicationModule {}
