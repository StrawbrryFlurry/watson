import { isConstructor, isUndefined, Type } from '@watson/common';

import { InstanceWrapper, Module } from '../injector';
import { BootstrappingException } from './bootstrapping.exception';

export class CircularDependencyException<
  T extends Type | Module | InstanceWrapper
> extends BootstrappingException {
  constructor(context: string, type: T, dependencyStack?: T[], idx?: number) {
    const resolveTypeName = (type: T) => {
      return isConstructor(type)
        ? type.name.replace(/class.*{.*}.*/, "")
        : type.name;
    };

    const dependencyGraph = isUndefined(dependencyStack)
      ? ""
      : `Dependency graph: ${[
          ...dependencyStack.map(resolveTypeName),
          "[?]",
        ].join(" -> ")}`;

    super(
      context,
      `Circular dependency detected in ${type.name}\n${dependencyGraph}`
    );
  }
}
