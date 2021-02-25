import { ICommandParam, isNil } from '@watsonjs/common';
import { Message } from 'discord.js';

export class CustomMessageTypeParser {
  public parseCustom(
    message: Message,
    content: string,
    param: ICommandParam
  ): Promise<any> | any {
    const { parser } = param;

    if (isNil(parser)) {
      return content;
    }

    return parser(message);
  }
}
