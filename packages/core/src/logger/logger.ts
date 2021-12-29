import { Injectable, Injector, InjectorInquirerContext, InjectorLifetime } from '@watsonjs/di';
import { green, red, white, yellow } from 'cli-color';

export enum LogType {
  STATUS,
  INFO,
  WARN,
  ERROR,
}

@Injectable({ lifetime: InjectorLifetime.Scoped })
export class Logger {
  public context!: string;

  private messagePrefix = `${yellow("[Watson]")} ${white(
    `[${(() => this.getDateString())()}] ${yellow(`[${this.context || ""}]`)}`
  )}`;

  constructor(inquirerCtx: InjectorInquirerContext) {
    const { inquirer } = inquirerCtx;

    if (inquirer === Injector) {
      this.context = "main";
    } else {
      this.context = inquirer.name;
    }
  }

  public log(messageArg: string | string[], type: LogType) {
    let message: string;

    if (Array.isArray(messageArg)) {
      message = messageArg.join(" ");
    } else {
      message = messageArg;
    }

    const coloredMessage = this.colorMessage(message, type);
    const messageString = `${this.messagePrefix} ${coloredMessage}`;

    if (type === LogType.ERROR) {
      return process.stderr.write(`${messageString}\n`);
    }

    return process.stdout.write(`${messageString}\n`);
  }

  /**
   * For logging internal status and error messages
   */
  public logMessage(message: string) {
    process.stdout.write(green(`${this.messagePrefix} ${message}\n`));
  }

  public logException(message: string, stack: any) {
    process.stdout.write(`${this.messagePrefix} ${red(message)}\n`);
    console.error(stack);
  }

  private colorMessage(message: string, type: LogType) {
    if (type === LogType.WARN) {
      return yellow(message);
    } else if (type === LogType.STATUS) {
      return green(message);
    } else if (type === LogType.ERROR) {
      return red(message);
    }
  }

  private getDateString() {
    // return dayjs().format("DD/MM/YYYY, HH:mm:ss").toString();
  }
}
