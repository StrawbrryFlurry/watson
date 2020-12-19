import { COMMAND_OPTIONS_METADATA, ICommandOptions, IReceiverOptions, RECEIVER_OPTIONS_METADATA } from '@watson/common';

import { InstanceWrapper, MetadataResolver } from '../injector';
import { Logger } from '../logger';
import { WatsonContainer } from '../watson-container';
import { CommandHandle } from './command-handle';

/**
 * Resolves commands from the WatsonContainer instance
 * Checks @\Commmand and @\Receiver decorator metadata
 */
export class CommandExplorer {
  private container: WatsonContainer;
  private resolver: MetadataResolver;

  private logger = new Logger("CommandExplorer");

  /**
   * Holds all commands registered in the application
   * @key Name of the receiver the command from
   * @value The command configuration
   */
  private commands = new Map<string, unknown>();

  constructor(container: WatsonContainer) {
    this.container = container;
    this.resolver = new MetadataResolver(container);
  }

  public explore() {
    this.resolveReceiverData();
  }

  private resolveReceiverData() {
    const receivers = this.container.globalInstanceHost.getAllInstancesOfType(
      "receiver"
    );

    for (const receiver of receivers) {
      const { wrapper, host } = receiver;

      const receiverOptions = this.resolver.getMetadata<IReceiverOptions>(
        RECEIVER_OPTIONS_METADATA,
        wrapper.metatype
      );

      this.resolveCommandsOfReceiver(wrapper, receiverOptions);
    }
  }

  private resolveCommandsOfReceiver(
    receiver: InstanceWrapper,
    receiverOptions: IReceiverOptions
  ) {
    const methods = this.resolver.resolveMethodsFromMetatype(receiver.metatype);

    if (methods.length === 0) {
      return;
    }

    for (const method of methods) {
      const commandOptions = this.resolver.getMetadata<ICommandOptions>(
        COMMAND_OPTIONS_METADATA,
        method.descriptor
      );

      new CommandHandle(
        method,
        receiverOptions,
        commandOptions,
        this.container.config
      );
    }
  }

  private createCommand(
    receiverOptions: IReceiverOptions,
    commandOptions: ICommandOptions
  ) {}
}
