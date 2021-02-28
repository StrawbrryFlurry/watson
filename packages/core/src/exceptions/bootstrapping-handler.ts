import { red } from 'cli-color';

import { BOOTSTRAPPING_ERROR_MESSAGE, EXCEPTION_STACK, Logger, SUGGESTION } from '../logger';
import { BootstrappingException } from './bootstrapping.exception';

export type ZoneFunction<T extends (...args: unknown[]) => unknown> = T;

/**
 * Executes the bootstrapping code in the  WatsonFactory class. On error this class formats the output.
 */
export class BootstrappingHandler {
  public static async run(fn: ZoneFunction<any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err: unknown) {
        if (err instanceof BootstrappingException) {
          const context = err.getContext();
          const logger = new Logger(context);
          const message = err.getMessage();
          const stack = err.getStack();

          logger.logMessage(BOOTSTRAPPING_ERROR_MESSAGE());
          logger.logMessage(red(message));

          if (err.hasSuggestions()) {
            err.suggestions.forEach((s) => logger.logMessage(SUGGESTION(s)));
          }

          if (stack) {
            logger.logMessage(EXCEPTION_STACK(stack));
          }

          reject(err);
        } else {
          const logger = new Logger("WatsonApplication");
          logger.logMessage(BOOTSTRAPPING_ERROR_MESSAGE());
          reject(err);
        }
      }
    });
  }
}
