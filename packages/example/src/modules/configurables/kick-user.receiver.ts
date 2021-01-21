import { Command, InjectParam, Receiver, UseFilters, UseGuards, UsePipes } from '@watsonjs/common';
import { GuildMember } from 'discord.js';

import { CanKickGuard } from './can-kick.guard';
import { GuildMessageFilter } from './guild-message.filter';
import { MentionPipe } from './mention.pipe';

@Receiver()
@UseGuards(CanKickGuard)
// Or
@UseGuards(new CanKickGuard())
export class KickUserReceiver {
  @UseFilters(GuildMessageFilter)
  @UsePipes(MentionPipe)
  @Command("kick")
  kick(@InjectParam("user") user: GuildMember) {
    console.log(user);
  }
}
