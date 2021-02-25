import { BadArgumentException, CommandContextData, EventException, UnauthorizedException } from '@watsonjs/common';
import { ClientUser, MessageEmbed } from 'discord.js';

import { EventExecutionContext } from '../lifecycle';
import { CommandRoute } from '../routes';
import { BAD_ARGUMENT_ERROR } from './bad-argument.error';
import { CUSTOM_ERROR } from './custom.error';
import { UNAUTHORIZED_ERROR } from './unauthorized.error';

export interface IErrorOptions {
  color: string;
  route: CommandRoute;
  clientUser: ClientUser;
}

export class ErrorHost {
  private messageColor: string;

  constructor() {
    this.configure();
  }

  public configure() {
    this.messageColor = "#ffd149";
  }

  public async handleCommonException(
    exception: EventException,
    ctx: EventExecutionContext<CommandContextData>
  ) {
    let message: MessageEmbed | string;

    if (exception.isMessageEmbed) {
      message = exception.data;
    } else if (exception.message) {
      message = CUSTOM_ERROR({
        message: exception.message,
        color: this.messageColor,
        route: ctx.getRoute(),
        clientUser: ctx.client.user,
      });
    } else if (exception instanceof BadArgumentException) {
      message = BAD_ARGUMENT_ERROR({
        clientUser: ctx.client.user,
        color: this.messageColor,
        param: exception.param,
        route: ctx.getRoute() as CommandRoute,
      });
    } else if (exception instanceof UnauthorizedException) {
      message = UNAUTHORIZED_ERROR({
        clientUser: ctx.client.user,
        color: this.messageColor,
        route: ctx.getRoute() as CommandRoute,
      });
    }

    const [msgEvent] = ctx.getEvent();
    const { channel } = msgEvent;
    await channel.send(message);
  }
}
