import { Interceptor } from '@core/logger';
import { isFunction, isNil } from '@watsonjs/common';
import { Type } from '@watsonjs/di';

import { ModuleInitException } from '../../exceptions/revisit';

export abstract class InterceptorsConsumer {
  protected getInstance<T = any, R = any>(
    type: Interceptor,
    injectable: Type | T,
    consumerFn: string,
    moduleToken: string,
    router: any
  ): R {
    if (consumerFn in injectable) {
      return injectable as any as R;
    }

    const moduleRef = ("" as any).getModuleByToken(moduleToken);

    if (!isFunction(injectable)) {
      throw new ModuleInitException(
        /*INTERCEPTOR_NOT_FOUND */ ("A" as any)(
          type,
          (injectable as any).name,
          injectable as any,
          router,
          moduleRef
        )
      );
    }

    const injectableRef = moduleRef.injectables.get(injectable);

    if (isNil(injectableRef)) {
      throw new ModuleInitException(
        /*INTERCEPTOR_NOT_FOUND */ ("A" as any)(
          type,
          (injectable as Type).name,
          injectable as Type,
          router,
          moduleRef
        )
      );
    }

    const { instance } = injectableRef;

    if (!(consumerFn in (instance as Type))) {
      throw new ModuleInitException(
        /* BAD_INTERCEPTOR_IMPLEMENTATION */ ("A" as any)(
          type,
          (injectable as Type).name,
          injectable as Type,
          router,
          moduleRef
        )
      );
    }

    return instance as R;
  }
}
