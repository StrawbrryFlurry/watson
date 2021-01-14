import { ICommandOptions, IParamDecoratorMetadata, IReceiverOptions, TReceiver } from '@watson/common';
import { Message } from 'discord.js';
import { EventRoute } from 'event';
import { IAsynchronousResolvable } from 'interfaces';

import { IMethodValue, InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { CommandConfiguration } from './command-config';
import { CommandParser } from './command-parser';

export interface ICommandParams {
  [name: string]: unknown;
}

export interface IParamDecorator extends IParamDecoratorMetadata {}

export class CommandRoute extends EventRoute<"message"> {
  public readonly config: CommandConfiguration;
  public readonly handler: Function;
  public readonly host: InstanceWrapper<TReceiver>;
  private readonly parser: CommandParser;

  constructor(
    commandOptions: ICommandOptions,
    receiverOptions: IReceiverOptions,
    receiver: InstanceWrapper<TReceiver>,
    handler: IMethodValue,
    container: WatsonContainer
  ) {
    super("command", container);

    this.config = new CommandConfiguration(
      commandOptions,
      receiverOptions,
      container.config,
      handler
    );

    this.handler = handler.descriptor;
    this.host = receiver;
    this.parser = new CommandParser(this.config);
  }

  public matchEvent(eventData: [Message]): IAsynchronousResolvable<boolean> {
    const [message] = eventData;
    const { content } = message;
    const { command } = this.parser.extractMessageParts(content);

    return (
      this.parser.matchesPrefix(content) && this.parser.matchesCommand(command)
    );
  }

  public createContextData(message: [Message]) {
    return this.parser.parse(message);
  }
}
