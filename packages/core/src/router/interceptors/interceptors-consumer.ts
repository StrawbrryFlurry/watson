import { isFunction, isNil, Type } from '@watsonjs/common';

import { ModuleInitException } from '../../exceptions';
import { InstanceWrapper } from '../../injector';
import { BAD_INTERCEPTOR_IMPLEMENTATION, Interceptor, INTERCEPTOR_NOT_FOUND } from '../../logger';
import { WatsonContainer } from '../../watson-container';

export abstract class InterceptorsConsumer {
  abstract injector: WatsonContainer;

  protected getInstance<T = any, R = any>(
    type: Interceptor,
    injectable: Type | T,
    consumerFn: string,
    moduleToken: string,
    receiver: InstanceWrapper
  ): R {
    if (consumerFn in injectable) {
      return injectable as any as R;
    }

    const moduleRef = this.container.getModuleByToken(moduleToken);

    if (!isFunction(injectable)) {
      throw new ModuleInitException(
        INTERCEPTOR_NOT_FOUND(
          type,
          (injectable as Type).name,
          injectable as Type,
          receiver,
          moduleRef
        )
      );
    }

    const injectableRef = moduleRef.injectables.get(injectable);

    if (isNil(injectableRef)) {
      throw new ModuleInitException(
        INTERCEPTOR_NOT_FOUND(
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
        BAD_INTERCEPTOR_IMPLEMENTATION(
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
