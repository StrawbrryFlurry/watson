import { Interceptor } from '@core/logger';
import { isFunction, isNil, Type } from '@watsonjs/common';

import { ModuleInitException } from '../../exceptions/revisit';

export abstract class InterceptorsConsumer {
  protected getInstance<T = any, R = any>(
    type: Interceptor,
    injectable: Type | T,
    consumerFn: string,
    moduleToken: string,
    receiver: any
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
          receiver,
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
          receiver,
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
          receiver,
          moduleRef
        )
      );
    }

    return instance as R;
  }
}
