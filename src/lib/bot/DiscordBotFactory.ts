import { cyan, white } from 'chalk';
import { Client, ClientOptions } from 'discord.js';

import { CommandManager } from '..';
import { ImportManager } from '../commands/Importer';
import { IncommingMessage } from '../commands/IncommingMessage';
import { getGlobalMetadataStorage } from '../metadata';
import { log } from '../util';
import { IDiscordBotOptions } from './interfaces';

export class DiscordBotFactory {
  private options: IDiscordBotOptions;
  private commandManager: CommandManager;
  private importManager: ImportManager;
  private client: Client;
  private prefix: string;

  constructor(options: IDiscordBotOptions, clientOptions?: ClientOptions) {
    this.client = new Client(clientOptions);
    this.commandManager = new CommandManager();
    this.importManager = new ImportManager({
      configName: options.configFileName,
    });

    this.options = options;
  }

  public async start() {
    log("BotFactory", "Starting DJS application...");

    await this.importManager.init();
    this.registerEvents();
    this.commandManager.loadCommands();
    this.registerCommandHandler();

    log("Client", "Starting djs client");

    await this.client.login(this.options.token);

    log("Client", "DJS application was successfully started");
  }

  public addGlobalPrefix(prefix: string) {
    this.prefix = prefix;
  }

  private registerCommandHandler() {
    this.client.on("message", (message) => {
      const msg = new IncommingMessage(message);
      try {
        this.commandManager.handleIncomingMessage(msg);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private registerEvents() {
    const eventHandles = getGlobalMetadataStorage().eventHandles;

    eventHandles.forEach((handle) => {
      const event = handle.options.event;
      log(
        "EventLoader",
        `Mapping event ${cyan(event)} with ${white(handle.propertyName)}`
      );
      this.client.on(event, handle.descriptor.value);
    });
  }
}
