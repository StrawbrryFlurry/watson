import { RouterRefImpl } from '@core/di';
import { Logger } from '@core/logger';
import {
  AsyncResolvable,
  ExceptionHandler,
  InterceptorType,
  isNil,
  ResolvedAsyncValue,
  RuntimeException,
} from '@watsonjs/common';
import {
  AfterResolution,
  ClassProvider,
  forwardRef,
  Injectable,
  Injector,
  InjectorLifetime,
  Optional,
  ProviderFactoryResolver,
  resolveAsyncValue,
  stringify,
} from '@watsonjs/di';

import { DefaultExceptionHandler } from './default-exception-handler';

export const WATSON_EXCEPTION_HANDLER_PROVIDER: ClassProvider = {
  provide: forwardRef(() => ExceptionHandlerRef),
  useClass: forwardRef(() => ExceptionHandlerImpl),
};

/**
 * A wrapper for the exception handler that is used
 * in the current injector scope. You can alter the
 * behavior of the exception handler by using the
 * `ExceptionHandler` injection token or using the
 * `@Catch()` decorator.
 */
@Injectable({ lifetime: InjectorLifetime.Scoped })
export abstract class ExceptionHandlerRef {
  public abstract handle(exception: RuntimeException | Error): Promise<void>;
  public abstract run<
    T extends AsyncResolvable<void>,
    R extends ResolvedAsyncValue<T>
  >(cb: () => T): Promise<R | null>;
}

export class ExceptionHandlerImpl implements AfterResolution {
  private _handler: ExceptionHandler;
  private _logger!: Logger;

  constructor(
    private _injector: Injector,
    @Optional() private _routerRef?: RouterRefImpl,
    @Optional() private _handlerRef?: ExceptionHandler
  ) {}

  async afterResolution(injector: Injector): Promise<void> {
    this._logger = await injector.get(Logger, null, null);
    this._handler = await this._makeExceptionHandler();
  }

  private async _makeExceptionHandler(): Promise<ExceptionHandler> {
    if (isNil(this._routerRef)) {
      if (!isNil(this._handlerRef)) {
        return this._handlerRef;
      }

      return this._injector.get(DefaultExceptionHandler);
    }

    const { classInterceptors, instanceInterceptors } =
      this._routerRef.getInterceptors(InterceptorType.ExceptionHandler) ?? {};

    const [[instanceHandler], [classHandler]] = [
      instanceInterceptors ?? [null],
      classInterceptors ?? [null],
    ];

    if (!isNil(instanceHandler)) {
      return <ExceptionHandler>(<any>instanceHandler);
    }

    if (!isNil(classHandler)) {
      const factoryResolver = await this._injector.get(ProviderFactoryResolver);
      const handlerFactory = await factoryResolver.resolve(classHandler);
      return handlerFactory.create<ExceptionHandler>();
    }

    return this._injector.get(DefaultExceptionHandler);
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
    const errorMessage = stringify(message);
    this._logger.logException(errorMessage, stack);
  }
}
