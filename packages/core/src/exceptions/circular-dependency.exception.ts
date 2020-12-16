import { isConstructor, isUndefined, Type } from '@watson/common';

import { InstanceWrapper, Module } from '../injector';

export class CircularDependencyException<
  T extends Type | Module | InstanceWrapper
> extends Error {
  constructor(type: T, context?: T[], idx?: number) {
    const resolveTypeName = (type: T) => {
      return isConstructor(type)
        ? type.name.replace(/class.*{.*}.*/, "")
        : type.name;
    };

    const dependencyGraph = isUndefined(context)
      ? ""
      : `Dependency graph: ${[...context.map(resolveTypeName), "[?]"].join(
          " -> "
        )}`;

    super(`Circular dependency detected in ${type.name}\n${dependencyGraph}`);
  }
}
