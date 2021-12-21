import { Type } from 'typescript';

import { BootstrapException } from '../bootstrap.exception';

export class InvalidComponentDefException extends BootstrapException {
  constructor(type: Type, componentName: string, message: string) {
    super(
      "ComponentParsing",
      (console.log as any)(type, componentName, message)
    );
  }
}
