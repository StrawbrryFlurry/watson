const UNKNOWN_COMPONENT_REFERENCE_SUGGESTIONS = [
  "Make sure the referenced module / provider is exported from the module.",
];

export class UnknownExportException extends Error {
  constructor(context: string, exportName: string, moduleName: string) {
    super(
      context +
        `The export ${exportName} doesn't exist in the module ${moduleName}`
    );
  }
}
