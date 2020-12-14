export class UnknownComponentReferenceException extends Error {
    constructor(componentName: string, module: string) {
      super(`Watson could not find a constructable type for the component ${componentName} in module ${module}`);
    }
  }
  