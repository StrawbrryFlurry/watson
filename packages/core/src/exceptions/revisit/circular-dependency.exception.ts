import { Module } from '@core/di';
import { isConstructor, isUndefined, Type } from '@watsonjs/common';

import { BootstrappingException } from './bootstrapping.exception';

export class CircularDependencyException<
  T extends Type | Module
> extends BootstrappingException {
  constructor(context: string, type: T, dependencyStack?: T[], idx?: number) {
    const resolveTypeName = (type: T) => {
      return isConstructor(type)
        ? (type as Type).name.replace(/class.*{.*}.*/, "")
        : (type as Type).name;
    };

    const dependencyGraph = isUndefined(dependencyStack)
      ? ""
      : `Dependency graph: ${[
          ...dependencyStack.map(resolveTypeName),
          "[?]",
        ].join(" -> ")}`;

    super(
      context,
      `Circular dependency detected in ${
        (type as Type).name
      }\n${dependencyGraph}`
    );
  }
}
