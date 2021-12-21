import { isClassConstructor, isUndefined } from '@watsonjs/common';
import { ModuleRef, Type } from '@watsonjs/di';

export class CircularDependencyException<
  T extends Type | ModuleRef
> extends Error {
  constructor(context: string, type: T, dependencyStack?: T[], idx?: number) {
    const resolveTypeName = (type: T) => {
      return isClassConstructor(type)
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
      context +
        `Circular dependency detected in ${
          (type as Type).name
        }\n${dependencyGraph}`
    );
  }
}
