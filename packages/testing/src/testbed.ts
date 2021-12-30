import { RouterRef } from '@watsonjs/core';
import { Channel, Guild, GuildMember, Message, User } from 'discord.js';

export abstract class TestBed {
  /**
   * Creates a remote e2e testing environment
   * that connects to a bot account in the
   * test server for checking the actual data
   * that was received by the Discord API
   * after the event.
   */
  public static createRemote(): Promise<AbstractTestFixture> {
    return <any>null;
  }

  /**
   * Creates a local noop implementation of
   * the fixture that doesn't make discord API
   * calls.
   */
  public static createNoop(): AbstractTestFixture {
    return <any>null;
  }
}

abstract class AbstractTestFixture {
  public router: RouterRef;

  public emitEvent() {}

  // Provide test discord event constructors
  abstract createMessageEvent(message: string, user?: User): Message;
  abstract createChannelCreateEvent(guild?: Guild): Channel;

  // Provide test discord objects
  public user: User;
  public guildMember: GuildMember;
  public guild: Guild;
}
