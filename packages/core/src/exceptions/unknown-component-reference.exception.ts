export class UnknownComponentReferenceException extends Error {
  constructor(componentName: string, module: string) {
    super(
      `Watson was not able to find a constructable type for the component ${componentName} in module ${module}`
    );
  }
}
