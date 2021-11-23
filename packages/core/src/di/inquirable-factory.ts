import { FindChannelInq, FindMemberInq, FindRoleInq, isNil, Type } from '@watsonjs/common';
import { CachedManager, Channel, Guild, GuildMember, Role, TextChannel } from 'discord.js';

import { Injector } from '..';

interface EventBase {
  guild?: Guild;
}

export class InquirableFactory {
  constructor(private _injector: Injector) {}

  /**
   * Creates the default global inquirables
   * available through DI in router methods
   * and their constructors.
   */
  public createGlobals(source: EventBase): [Type, Function][] {
    const inquirables = [];

    inquirables.push(...this._createFindInq(source));

    return [];
  }

  private _createFindInq(source: EventBase) {
    const { guild } = source;

    const findInManager = <T>(
      manager: CachedManager<string, T, any> | undefined,
      name: string,
      fuzzy: boolean = false,
      findCb: (e: T) => boolean
    ) => {
      if (isNil(manager)) {
        return null;
      }

      if (fuzzy) {
        return manager.cache.find(findCb as any);
      }

      return manager.resolve(name);
    };

    const ROLE_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<Role>(guild?.roles, name, fuzzy, (role) =>
        role.name.includes(name)
      );

    const CHANNEL_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<Channel>(guild?.channels, name, fuzzy, (channel) =>
        (channel as TextChannel).name?.includes(name)
      );

    const MEMBER_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<GuildMember>(
        guild?.members,
        name,
        fuzzy,
        (member) =>
          member.nickname?.includes(name) || member.displayName.includes(name)
      );

    return [
      [FindChannelInq, CHANNEL_INQ],
      [FindRoleInq, ROLE_INQ],
      [FindMemberInq, MEMBER_INQ],
    ];
  }
}
