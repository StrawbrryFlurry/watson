import {
  BadArgumentException,
  Command,
  CommandArgumentType,
  ICommandParam,
  InjectParam,
  Receiver,
  UnauthorizedException,
  UseExceptionHandler,
} from '@watsonjs/common';

import { CustomException } from './custom.exception';
import { CustomExceptionHandler } from './custom.handler';

@Receiver()
@UseExceptionHandler(CustomExceptionHandler)
export class ExceptionsReceiver {
  @Command({
    name: "throw",
    params: [{ name: "type", type: CommandArgumentType.STRING }],
  })
  handleThrow(@InjectParam("type") type: string) {
    if (type === "custom") {
      throw new CustomException();
    } else if (type === "unauthorized") {
      throw new UnauthorizedException();
    } else if (type === "argument") {
      throw new BadArgumentException({
        name: "param",
        type: CommandArgumentType.CHANNEL,
      } as ICommandParam);
    }
  }
}
