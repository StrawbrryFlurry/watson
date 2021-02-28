import { BadArgumentException, EventException, UnauthorizedException } from '@watsonjs/common';
import { ClientUser, MessageEmbed } from 'discord.js';

import { CommandPipelineHost } from '../command';
import { ExecutionContextHost } from '../lifecycle';
import { CommandRouteHost } from '../router';
import { BAD_ARGUMENT_ERROR } from './bad-argument.error';
import { CUSTOM_ERROR } from './custom.error';
import { UNAUTHORIZED_ERROR } from './unauthorized.error';

export interface IErrorOptions {
  color: string;
  route: CommandRouteHost;
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
    ctx: ExecutionContextHost<CommandPipelineHost>
  ) {
    let message: MessageEmbed | string;
    const { user } = ctx.getClient();
    const { route } = ctx.switchToCommand();

    if (exception.isMessageEmbed) {
      message = exception.data;
    } else if (exception.message) {
      message = CUSTOM_ERROR({
        message: exception.message,
        color: this.messageColor,
        route: route,
        clientUser: user,
      });
    } else if (exception instanceof BadArgumentException) {
      message = BAD_ARGUMENT_ERROR({
        clientUser: user,
        color: this.messageColor,
        param: exception.param,
        route: route,
      });
    } else if (exception instanceof UnauthorizedException) {
      message = UNAUTHORIZED_ERROR({
        clientUser: user,
        color: this.messageColor,
        route: route,
      });
    }

    const [msgEvent] = ctx.getEvent();
    const { channel } = msgEvent;
    await channel.send(message);
  }
}
