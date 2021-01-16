import { Message } from 'discord.js';
import { Observable } from 'rxjs';

/**
 * Creates a custom returnable that will be called by the response controller.
 * Use this to implementing the user interaction by yourself.
 */
export function createCustomReturnable<T>(
  data: T,
  cb: (message: Message, data: T) => void | Promise<void> | Observable<void>
) {}
