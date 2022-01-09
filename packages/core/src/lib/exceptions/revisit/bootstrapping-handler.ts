import { red } from 'cli-color';

import { BOOTSTRAPPING_ERROR_MESSAGE, EXCEPTION_STACK, Logger, SUGGESTION } from '../../logger';

export type ZoneFunction<T extends (...args: unknown[]) => unknown> = T;

/**
 * Executes the bootstrapping code in the  WatsonFactory class.
 * On error this class formats the output.
 *
 * TODO:
 */
export class BootstrappingHandler {
  public static async run(fn: ZoneFunction<any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const context = (err as any).getContext();
          const logger = new Logger("" as any);
          const message = (err as any).getMessage();
          const stack = (err as any).getStack();

          logger.logMessage(BOOTSTRAPPING_ERROR_MESSAGE());
          logger.logMessage(red(message));

          if ((err as any).hasSuggestions()) {
            (err as any).suggestions!.forEach((s: any) =>
              logger.logMessage(SUGGESTION(s))
            );
          }

          if (stack) {
            logger.logMessage(EXCEPTION_STACK(stack));
          }

          reject(err);
        } else {
          const logger = new Logger("" as any);
          logger.logMessage(BOOTSTRAPPING_ERROR_MESSAGE());
          reject(err);
        }
      }
    });
  }
}
