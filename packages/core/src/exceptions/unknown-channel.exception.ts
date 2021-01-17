import { CommandRoute } from '../routes';
import { RuntimeException } from './runtime-exception';

export class UnknownChannelException extends RuntimeException {
  constructor(channel: string, command: CommandRoute) {
    super(
      `Channel ${channel} was not found while executing command ${command.name}`
    );
  }
}
