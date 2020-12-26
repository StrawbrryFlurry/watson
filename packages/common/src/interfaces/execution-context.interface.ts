import { Message } from 'discord.js';

export interface ExecutionContext {
  getHandler<T = any>(): T;
  getMessage(): Message;
}
