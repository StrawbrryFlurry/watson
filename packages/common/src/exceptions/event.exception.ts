import { MessageEmbed } from 'discord.js';

import { ExecutionContext } from '../interfaces';
import { RuntimeException } from './runtime-exception';

/**
 * Base class that is extended by exceptions that are thrown during event execution.
 */
export abstract class EventException extends RuntimeException {
  protected _context: ExecutionContext;
  public readonly isMessageEmbed: boolean;
  public readonly data: string | MessageEmbed;

  constructor(message?: string);
  constructor(message?: MessageEmbed);
  constructor(args?: string | MessageEmbed) {
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

  public get context(): ExecutionContext {
    return this._context;
  }
}
