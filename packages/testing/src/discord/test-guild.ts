import { WatsonEvent } from '@watsonjs/common';
import { UserResolvable } from 'discord.js';

export class TestGuild {
  constructor() {}

  public invokeEvent(event: WatsonEvent) {}

  public getChannels() {}
  public getLastMessageOfUser(user: UserResolvable) {}
}
