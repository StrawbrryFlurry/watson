import { Observable } from "rxjs";

import {
  CommandContextData,
  EventContextData,
  SlashContextData,
} from "../../interfaces";

/**
 * Pipe transforms allow you to alter context data directly.
 * Changes in the context will affect the resulting arguments and other data that will be injected when running the command handle.
 *
 * @param ctxData Data of the current context like arguments of a command.
 */
export interface PipeTransform<
  T extends CommandContextData | SlashContextData | EventContextData = any
> {
  transform(
    ctxData: T
  ): Partial<T> | Promise<Partial<T>> | Observable<Partial<T>>;
}
