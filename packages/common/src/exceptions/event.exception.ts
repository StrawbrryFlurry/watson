import { MessageEmbed } from 'discord.js';
import { ExecutionContext } from 'interfaces';

/**
 * Base class that is extended by exceptions that are thrown during event execution.
 */
export abstract class EventException extends Error {
  protected _context: ExecutionContext;
  public readonly isMessageEmbed: boolean;
  public readonly data: string | MessageEmbed;

  constructor(message: string);
  constructor(message: MessageEmbed);
  constructor(args: string | MessageEmbed) {
    const isMessageEmbed = args instanceof MessageEmbed;
    const message = isMessageEmbed ? "" : args;

    super(message as string);

    this.data = args;
    this.isMessageEmbed = isMessageEmbed;
  }

  /**
   * The framework will use this method to apply the current execution context to the exception
   */
  public applyContext(ctx: ExecutionContext) {
    this._context = ctx;
  }

  public get context() {
    return this._context;
  }
}
