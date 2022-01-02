import { Binding, createBinding, FactoryFnWithoutDeps } from '@di/core/binding';
import { DependencyGraph } from '@di/core/dependency-graph';
import { Injector, InjectorGetResult, NOT_FOUND, ProviderResolvable } from '@di/core/injector';
import { InquirerContext } from '@di/core/inquirer-context';
import { ModuleRef } from '@di/core/module-ref';
import { W_LAZY_INST } from '@di/fields';
import { AfterResolution } from '@di/hooks';
import { isUseExistingProvider } from '@di/providers/custom-provider';
import { CustomProvider, FactoryProvider, UseExistingProvider } from '@di/providers/custom-provider.interface';
import { InjectFlag } from '@di/providers/inject-flag';
import { getInjectableDef, getProviderToken } from '@di/providers/injectable-def';
import { InjectorLifetime, Providable } from '@di/providers/injection-token';
import { resolveAsyncValue, stringify } from '@di/utils';
import { isFunction, isNil } from '@di/utils/common';

import type { DynamicInjector } from "@di/core/dynamic-injector";

// @internal
// Shared implementation of internal injector
// capabilities.
// DO NOT use these functions outside
// of the core API.

/**
 * Binds a set of providers to an injector.
 */
export function ɵbindProviders(
  injector: Injector,
  /** The records map of the injector */
  records: Map<Providable, Binding | Binding[]>,
  providers: ProviderResolvable[]
): void {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const token = getProviderToken(provider);
    const hasBinding = records.get(token);
    let binding: Binding;

    if (isUseExistingProvider(<CustomProvider>provider)) {
      const { provide, useExisting, multi } = <UseExistingProvider>provider;

      binding = createBinding({
        provide: provide,
        useFactory: () => injector.get(useExisting),
        multi,
      } as FactoryProvider);
    } else {
      binding = createBinding(provider);
    }

    const { multi } = binding;

    if (!isNil(hasBinding) && !multi) {
      const { providedIn } = getInjectableDef(token);
      /**
       * If this injector is the root injector,
       * it is likely that some providers are
       * added to this injector's provider scope
       * multiple times via modules or through
       * providedIn "root" `@Injectable` declarations.
       *
       * We can just skip over them as they were added
       * to the root injector already.
       */
      if (providedIn === "root") {
        continue;
      }

      throw `Found multiple providers with the same token: "${stringify(
        token
      )}" that are not \`multi\``;
    }

    const record = multi
      ? [...((hasBinding as Binding[]) ?? []), binding]
      : binding;
    records.set(token, record);
  }
}

export function ɵallowProviderResolutionInParent(
  typeOrToken: Providable,
  injector: Injector,
  injectFlag?: InjectFlag
) {
  const { providedIn } = getInjectableDef(typeOrToken);
  const { scope, isComponent } = <DynamicInjector>injector;

  if (
    (!isComponent && !isNil(scope) && providedIn === "module") ||
    (injectFlag && injectFlag & InjectFlag.Self)
  ) {
    return false;
  }

  return true;
}

/**
 * Resolves all dependencies of a binding. This is a recursive
 * function that will resolve all dependencies of a binding
 * and all dependencies of those dependencies.
 */
export async function ɵresolveBindingDependencies<
  T extends Providable,
  D extends Providable[] | [],
  I extends InjectorGetResult<T>,
  B extends Binding<T, D, I>,
  O extends object[]
>(
  binding: B,
  injector: Injector,
  ctx: Injector | null,
  inquirerContext: InquirerContext
): Promise<{ dependencies: O; lazyDependencies: O }> {
  const { deps, token, injectFlags } = binding;
  const dependencyGraph = (inquirerContext.dependencyGraph ??=
    new DependencyGraph());

  dependencyGraph.add(token);
  const dependencies: (object | null)[] = [];
  const lazyDependencies: object[] = [];

  for (let i = 0; i < (<D>deps).length; i++) {
    const dep = deps![i];
    const flags = injectFlags[i];
    let depInjector: Injector = injector;

    // In this instance skip
    if (dep === InquirerContext) {
      dependencies.push(<any>inquirerContext.seal());
      continue;
    }

    if (flags & InjectFlag.SkipSelf) {
      depInjector = injector.parent ?? Injector.NULL;
    } else if (flags & InjectFlag.Host) {
      depInjector = await injector.get(ModuleRef);
    }

    const dependencyContext = inquirerContext.clone(<Binding>binding, i);

    // if (flags & InjectFlag.Lazy) {
    //   dependencyGraph!.remove(dep);
    //   const lazyDependency = await ɵcreateLazyDependency(
    //     dep,
    //     depInjector,
    //     ctx,
    //     dependencyContext,
    //     flags
    //   );

    //   lazyDependencies.push(lazyDependency);
    //   dependencies.push(lazyDependency);
    //   continue;
    // }

    if (dependencyGraph.has(dep) && flags & InjectFlag.Optional) {
      dependencies.push(null);
      continue;
    }

    dependencyGraph!.checkAndThrow(dep);
    dependencyGraph!.add(dep);

    let instance = await depInjector.get(
      dep,
      NOT_FOUND,
      ctx,
      dependencyContext,
      flags
    );

    if (instance === NOT_FOUND) {
      if (flags & InjectFlag.Optional) {
        instance = null;
      } else {
        await Injector.NULL.get(dep);
      }
    }

    dependencyGraph.remove(dep);
    dependencies.push(instance);
  }

  dependencyGraph.remove(token);
  return {
    dependencies: <O>dependencies,
    lazyDependencies: <O>lazyDependencies,
  };
}

/**
 * Fully resolves an instance using the
 * binding provided. Recursively looks
 * up all provider dependencies and
 * creates them as well.
 */
export async function ɵcreateBindingInstance<
  T extends Providable,
  D extends Providable[] | [],
  I extends InjectorGetResult<T>,
  B extends Binding<T, D, I> | Binding<T, D, I>[],
  R extends B extends Binding[] ? I[] : I
>(
  binding: B,
  injector: Injector,
  ctx: Injector | null,
  inquirerContext: InquirerContext
): Promise<R> {
  // MultiProviders return an array of bindings.
  if (Array.isArray(binding)) {
    const instances: I[] = [];
    for (let i = 0; i < binding.length; i++) {
      const instance = await ɵcreateBindingInstance(
        <Binding>binding[i],
        injector,
        ctx,
        inquirerContext
      );
      instances.push(<I>instance);
    }

    return instances as R;
  }

  const { lifetime } = <Binding<T, D, I>>binding;

  let lookupCtx = ctx;

  /**
   * When dealing with module scoped dependencies
   * we're using the module injector as the key
   * for the binding instance map. Components are
   * treated as their own module as well.
   */
  if (lifetime & InjectorLifetime.Scoped) {
    lookupCtx = injector;
  }

  const instance = binding.getInstance(lookupCtx);

  if (
    !isNil(instance) &&
    // The binding only has static dependencies
    (binding.isDependencyTreeStatic() ||
      // We have a ContextInjector and the binding
      // we're looking for has an instance for that
      // context PLUS the binding doesn't have
      // purely transient dependencies
      (ctx === lookupCtx && !binding.isTransientByDependency()))
  ) {
    return <R>instance;
  }

  if (!binding.hasDependencies()) {
    const instance = await resolveAsyncValue(
      (<FactoryFnWithoutDeps>binding.factory)()
    );

    if (!binding.isTransient()) {
      binding.setInstance(<I>instance, lookupCtx);
    }

    return <R>instance;
  }

  const { dependencies, lazyDependencies } = await ɵresolveBindingDependencies(
    <Binding>binding,
    injector,
    ctx,
    inquirerContext
  );

  const _instance = await resolveAsyncValue(
    binding.factory(...(<D>dependencies))
  );

  const { afterResolution } = <AfterResolution>_instance ?? {};

  if (isFunction(afterResolution)) {
    await resolveAsyncValue(afterResolution.call(_instance, injector));
  }

  for (let i = 0; i < lazyDependencies.length; i++) {
    const lazyDependency = lazyDependencies[i];
    lazyDependency[W_LAZY_INST] = _instance;
  }

  if (!binding.isTransient()) {
    binding.setInstance(<I>_instance, lookupCtx);
  }

  return <R>_instance;
}

// Figuring out lazy loading providers

// function ɵresolveLazyProvider(target: object, injector: Injector) {
//   return injector.get(target);
// }

// export async function ɵcreateLazyDependency(
//   token: Providable,
//   injector: Injector,
//   ctx: Injector | null,
//   inquirerContext: InquirerContext,
//   injectFlag: InjectFlag
// ) {
//   const { binding, injector: bindingInjector } =
//     ɵgetBindingFromInjector(token, injector, injectFlag) ?? {};

//   if (isNil(binding)) {
//     throw new Error(
//       `No provider for lazy provider ${stringify(token)} in ${stringify(
//         injector
//       )}`
//     );
//   }

//   const { dependencies } = await ɵresolveBindingDependencies(
//     binding,
//     bindingInjector!,
//     ctx,
//     inquirerContext
//   );

//   const lazyDependencyPlaceholder = new Proxy(token, {
//     get(target, prop) {
//       if (prop === W_LAZY_INST) {
//         return target[W_LAZY_INST] ?? null;
//       }

//       const lazyInstance = lazyDependencyPlaceholder[W_LAZY_INST];

//       if (isNil(lazyInstance)) {
//         return undefined;
//       }

//       const provider = binding.factory(...dependencies);
//       replaceProxyInInstance(lazyInstance, lazyDependencyPlaceholder, provider);
//       return Reflect.get(provider, prop);
//     },
//   });

//   return lazyDependencyPlaceholder;
// }

// function replaceProxyInInstance(
//   targetInstance: object,
//   proxy: object,
//   resolvedInstance: object
// ) {
//   Object.entries(targetInstance).forEach(([key, value]) => {
//     if (value === proxy) {
//       targetInstance[key] = resolvedInstance;
//     }
//   });
// }

// export function ɵgetBindingFromInjector(
//   token: Providable,
//   injector: Injector,
//   injectFlag?: InjectFlag
// ): { binding: Binding; injector: Injector } | null {
//   const records = (<ɵHasInjectorRecords>(<any>injector))[W_INJ_REC];
//   const binding = records.get(token);

//   if (!isNil(binding)) {
//     return { binding, injector };
//   }

//   const { parent } = injector;

//   if (
//     !isNil(parent) &&
//     ɵallowProviderResolutionInParent(token, injector, injectFlag)
//   ) {
//     return ɵgetBindingFromInjector(token, parent);
//   }

//   return null;
// }
