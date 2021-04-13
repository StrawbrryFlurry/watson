import { GuildTestingModule, TestBed } from '@watsonjs/testing';

import { AppReceiver } from './app.receiver';

describe("Test", () => {
  let app: GuildTestingModule;

  beforeAll(async () => {
    app = TestBed.createTestingModule(
      {
        receivers: [AppReceiver],
      },
      {
        discordAuthToken:
          "NzkxNTI0NzQ2NDc3OTYxMjc2.X-Qa3Q.3xyZ95sNuAV7_KuheDjVdgJOstg",
      }
    ).compileWithGuildIntegration({
      testChannelId: "740200959166382091",
      testGuild: "436839895546462208",
    });
  });

  it("", () => {});
});
