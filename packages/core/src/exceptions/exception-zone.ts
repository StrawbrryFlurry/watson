import { Logger } from '../logger';
import { BootstrappingException } from './bootstrapping.exception';

export type ZoneFunction<T extends (...args) => unknown> = T;

/**
 * Executes the bootstrapping code in the  WatsonFactory class. On error this class formats the output.
 */
export class BootstrappingZone {
  public static async runAsync(fn: ZoneFunction<any>) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err: unknown) {
        if (err instanceof BootstrappingException) {
          const context = err.getContext();
          const message = err.getMessage();
          const logger = new Logger(context);
          logger.log(message, "error");
          logger.log(err.getStack(), "information");
          reject(err);
        } else {
          throw err;
        }
      }
    });
  }
}
