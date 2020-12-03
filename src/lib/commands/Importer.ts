import { IConfiguration } from '../config/interfaces';
import { FileManager } from './FileManager';
import { IImportManagerOptions } from './interfaces';

export class ImportManager {
  constructor({ configName = "config.json" }: IImportManagerOptions) {
    this.fileManager = new FileManager();
    this.baseConfigName = configName;
  }

  public async init() {
    this.config = await this.resolveConfig();
    this.commandFiles = await this.resolveCommandFiles();
    await this.importCommands();
  }

  private baseConfigName: string;
  private config: IConfiguration;
  private fileManager: FileManager;
  private commandFiles: string[];

  private async resolveConfig() {
    const files = await this.fileManager.getFolderContent(
      this.fileManager.baseDir
    );

    const configFile = files.find((file) => file.includes(this.baseConfigName));

    if (typeof configFile === "undefined") {
      throw new Error("The config file was not found in the base directory");
    }

    const { default: config } = (await import(configFile)) as {
      default: IConfiguration;
    };

    return config;
  }

  private async resolveCommandFiles() {
    const files = await Promise.all(
      this.config.commands.map(async (commandWildcard) =>
        this.fileManager.getFileByWildcard(commandWildcard)
      )
    );

    return files.reduce((result, fileList) => [...result, ...fileList], []);
  }

  private async importCommands() {
    return Promise.all(this.commandFiles.map((command) => import(command)));
  }
}
