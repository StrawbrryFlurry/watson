import { BadArgumentException, CommandException, UnatuhorizedException } from '@watson/common';
import { ClientUser, MessageEmbed } from 'discord.js';

import { CommandRoute } from '../command';
import { CommandExecutionContext } from '../lifecycle';
import { BAD_ARGUMENT_ERROR } from './bad-argument.error';
import { UNAUTHORIZED_ERROR } from './unauthorized.error';

export interface IErrorOptions {
  color: string;
  route: CommandRoute;
  clientUser: ClientUser;
}

export class ErrorHost {
  private messageColor: string;

  public configure() {}

  public handleMessageEmbedException(
    ctx: CommandExecutionContext,
    embed: MessageEmbed
  ) {
    return this.sendToChannel(embed, ctx);
  }

  public async handleCommandException(
    ctx: CommandExecutionContext,
    exception: CommandException
  ) {
    exception.setContext(ctx);
    let message: MessageEmbed | string;

    if (exception instanceof BadArgumentException) {
      message = BAD_ARGUMENT_ERROR({
        clientUser: ctx.client.user,
        color: this.messageColor,
        param: exception.param,
        route: ctx.getContext(),
      });
    } else if (exception instanceof UnatuhorizedException) {
      message = UNAUTHORIZED_ERROR({
        clientUser: ctx.client.user,
        color: this.messageColor,
        route: ctx.getContext(),
      });
    } else {
      message =
        "An error occured while executing the command! Please contact the owner of the bot for additional information";
    }

    await this.sendToChannel(message, ctx);
  }

  private async sendToChannel(
    message: string | MessageEmbed,
    { responseChannel }: CommandExecutionContext
  ) {
    await responseChannel.send(message);
  }
}
