import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@watsonjs/common';

@Injectable()
export class CanKickGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext) {
    const [message] = ctx.getEvent<"message">();
    const { author, guild } = message;

    const member = guild.members.cache.get(author.id);

    if (member.hasPermission("KICK_MEMBERS")) {
      return true;
    }

    throw new UnauthorizedException(
      "You don't have permissions to use this command"
    );
  }
}
