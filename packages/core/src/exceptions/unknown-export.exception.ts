export class UnknownExportException extends Error {
  constructor(exportName: string, moduleName: string) {
    super(`The export ${exportName} doesn't exist in the module ${moduleName}`);
  }
}
