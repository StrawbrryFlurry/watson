import { Command, InjectChannel, InjectReact, InjectUser, ReactFunction, Receiver } from '@watsonjs/common';
import { MessageReaction, TextChannel, User } from 'discord.js';

const checkReactionFilter = (reaction: MessageReaction) =>
  reaction.emoji.name === "✅";

@Receiver()
export class ReactInquirableReceiver {
  @Command("verify")
  async verifyCommand(
    @InjectReact() reactFn: ReactFunction<MessageReaction[]>,
    @InjectChannel() channel: TextChannel,
    @InjectUser() user: User
  ) {
    const reactions = await reactFn(
      "React to this message with a ✅ to get verified",
      { time: 60000 },
      checkReactionFilter
    );

    const hasUser = reactions.some((r) => r.users.cache.has(user.id));

    if (reactions.length === 0 || !hasUser) {
      return channel.send("You didn't react in time");
    }

    return channel.send("Congrats you're now verified");
  }
}
