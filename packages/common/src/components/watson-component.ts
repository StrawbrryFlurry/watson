import { Message } from 'discord.js';

export interface IReactiveOptions {
  /**
   * The time the message stays reactive for.
   * A lot of listeners might impact the performance of your application.
   * @default 60000ms One minute
   */
  timeReactive: number;
}

export abstract class WatsonComponent {
  protected message: Message;
  protected isSent: boolean;
  protected timeReactive: number;

  constructor(
    message: Message,
    options: IReactiveOptions = { timeReactive: 60000 }
  ) {}
}
