import {
  BadArgumentException,
  CommandRoute,
  ExecutionContext,
  MissingArgumentException,
  RuntimeException,
  UnauthorizedException,
} from '@watsonjs/common';
import { ClientUser, MessageEmbed } from 'discord.js';

import { BAD_ARGUMENT_ERROR } from './bad-argument.error';
import { CUSTOM_ERROR } from './custom.error';
import { MISSING_ARGUMENT_ERROR } from './missing-argument.error';
import { UNAUTHORIZED_ERROR } from './unauthorized.error';

export interface ErrorOptions {
  color: string;
  route: CommandRoute;
  clientUser: ClientUser;
}

export class ErrorHost {
  private messageColor!: string;

  constructor() {
    this.configure();
  }

  public configure() {
    this.messageColor = "#ffd149";
  }

  public async handleCommonException(
    exception: RuntimeException,
    ctx: ExecutionContext
  ) {
    let message: MessageEmbed | string;
    const { user } = ctx.getClient();
    const { route, channel } = ctx.switchToCommand();

    if ((exception as any).isMessageEmbed) {
      message = (exception as any).data;
    } else if (exception.message) {
      message = CUSTOM_ERROR({
        message: exception.message,
        color: this.messageColor,
        route: route,
        clientUser: user!,
      });
    } else if (exception instanceof BadArgumentException) {
      message = BAD_ARGUMENT_ERROR({
        clientUser: user!,
        color: this.messageColor,
        argument: exception.argument,
        route: route,
      });
    } else if (exception instanceof UnauthorizedException) {
      message = UNAUTHORIZED_ERROR({
        clientUser: user!,
        color: this.messageColor,
        route: route,
      });
    } else if (exception instanceof MissingArgumentException) {
      message = MISSING_ARGUMENT_ERROR({
        clientUser: user!,
        color: this.messageColor,
        parameters: exception.params,
        route: route,
      });
    }

    await channel.send(message! as any);
  }
}
