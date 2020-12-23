import { BootstrappingException } from './bootstrapping.exception';

export class UnknownExportException extends BootstrappingException {
  constructor(context: string, exportName: string, moduleName: string) {
    super(
      context,
      `The export ${exportName} doesn't exist in the module ${moduleName}`
    );
  }
}
