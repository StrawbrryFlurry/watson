import { green, red, yellow } from 'cli-color';
import * as dayjs from 'dayjs';

/**
 * @status Status type is logged as green
 * @information Infrmation type is logged in yellow
 * @error Error type is logged in red
 */
export type ILogInformationType = "status" | "information" | "error";
/**
 * The Context the message is logged from
 * @example WatsonFactory
 */
export type IlogContext = string;

export class Logger {
  private messagePrefix = `${yellow("[Watson]")} ${green(
    `[${(() => this.getDateString())()}] ${yellow(`[${this.context || ""}]`)}`
  )}`;

  constructor(private readonly context?: IlogContext) {}

  public log(messageArg: string | string[], type: ILogInformationType) {
    let message: string;

    if (Array.isArray(messageArg)) {
      message = messageArg.join(" ");
    } else {
      message = messageArg;
    }

    const coloredMessage = this.colorMessage(message, type);
    const messageString = `${this.messagePrefix} ${coloredMessage}`;

    if (type === "error") {
      return process.stderr.write(`${messageString}\n`);
    }

    return process.stdout.write(`${messageString}\n`);
  }

  /**
   * For logging internal status and error messages
   */
  public logMessage(message: string) {
    process.stdout.write(`${this.messagePrefix} ${message}`);
  }

  private colorMessage(message: string, type: ILogInformationType) {
    if (type === "information") {
      return yellow(message);
    } else if (type === "status") {
      return green(message);
    } else if (type === "error") {
      return red(message);
    }
  }

  private getDateString() {
    return dayjs().format("DD.MM.YYYY-HH:mm:ss").toString();
  }
}
