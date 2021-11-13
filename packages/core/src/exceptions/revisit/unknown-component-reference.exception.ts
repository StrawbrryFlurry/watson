const UNKNOWN_COMPONENT_REFERENCE_SUGGESTIONS = [
  "Make sure the referenced type is imported in the module or set as a provider / router",
];

export class UnknownComponentReferenceException extends Error {
  constructor(context: string, componentName: string, module: string) {
    super(
      context +
        `Watson was not able to find a constructable type for the component ${componentName} in module ${module}` +
        UNKNOWN_COMPONENT_REFERENCE_SUGGESTIONS
    );
  }
}
