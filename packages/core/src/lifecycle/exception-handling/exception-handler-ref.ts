import {
  AsyncResolvable,
  ExceptionHandler,
  ExceptionHandlerHost,
  isString,
  ResolvedAsyncValue,
  RuntimeException,
} from '@watsonjs/common';
import { Logger } from '@watsonjs/core/src';
import {
  AfterResolution,
  Injectable,
  Injector,
  InjectorLifetime,
  InquirerContext,
  resolveAsyncValue,
  stringify,
} from '@watsonjs/di';

@Injectable({ providedIn: "ctx", lifetime: InjectorLifetime.Scoped })
export abstract class ExceptionHandlerHostRef implements ExceptionHandlerHost {
  public abstract handle(exception: RuntimeException | Error): Promise<void>;
  public abstract run<
    T extends AsyncResolvable<void>,
    R extends ResolvedAsyncValue<T>
  >(cb: () => T): Promise<R | null>;
}

export class ExceptionHandlerHostImpl
  implements ExceptionHandlerHost, AfterResolution
{
  private _handler: ExceptionHandler;
  private _logger!: Logger;

  constructor(handler: ExceptionHandler) {
    this._handler = handler;
  }

  async afterResolution(injector: Injector): Promise<void> {
    this._logger = await injector.get(
      Logger,
      null,
      null,
      new InquirerContext(ExceptionHandlerHostRef)
    );
  }

  public async run<
    T extends AsyncResolvable<void>,
    R extends ResolvedAsyncValue<T>
  >(cb: () => T): Promise<R | null> {
    try {
      return <R>resolveAsyncValue(cb());
    } catch (err) {
      await this.handle(err as any);
    }

    return null;
  }

  public async handle(exception: RuntimeException | Error): Promise<void> {
    if (!(exception instanceof RuntimeException)) {
      if (!(exception instanceof Error)) {
        return this._handleUnknownException(exception);
      }

      return this._handleUnknownException(exception.message, exception.stack);
    }

    return resolveAsyncValue(this._handler.catch(exception));
  }

  private _handleUnknownException(message: any, stack?: any): void {
    let errorMessage: string;

    if (isString(message)) {
      errorMessage = message;
    } else {
      errorMessage = stringify(message);
    }

    this._logger.logException(errorMessage, stack);
  }
}
