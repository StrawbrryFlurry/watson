import { CollectFunction, InjectCollect, Receiver } from '@watsonjs/common';
import { MessageReaction } from 'discord.js';

const REACTION_FILTER = (reaction: MessageReaction) =>
  reaction.emoji.name === "🎉";

@Receiver()
export class CollectionInquirableReceiver {
  @core/command("game")
  async handleGame(@InjectCollect() collectFn: CollectFunction) {
    const [participantReaction] = (await collectFn(
      "React to this message with 🎉 to take part in the game",
      REACTION_FILTER,
      "reaction"
    )) as MessageReaction[];

    if (participantReaction === undefined) {
      return "Noone responed in time 🤷‍♀️";
    }

    const participants = participantReaction.users.cache.reduce(
      (users, user) => [...users, user],
      []
    );
  }
}
