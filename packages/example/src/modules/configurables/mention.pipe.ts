import { BadArgumentException, ExecutionContext, getId, Injectable, isNil, PipeTransform } from '@watsonjs/common';
import { Message } from 'discord.js';

@Injectable()
export class MentionPipe implements PipeTransform {
  transform(ctx: ExecutionContext) {
    const [message] = ctx.getEvent<Message>();
    const route = ctx.switchToCommand().getCommand();

    const { content, guild } = message;
    const { prefix, name } = route;

    const withoutCommand = content.substring(prefix.length + name.length);
    const [, mention] = withoutCommand.split(" ");
    const userId = getId("user", mention);

    if (isNil(userId)) {
      throw new BadArgumentException(
        "The first argument has to be a user mention."
      );
    }

    const user = guild.members.cache.get(userId);

    return {
      user,
    };
  }
}
