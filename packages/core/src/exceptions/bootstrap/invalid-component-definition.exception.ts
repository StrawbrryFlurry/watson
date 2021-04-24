import { TComponent } from '@watsonjs/common';

import { INVALID_COMPONENT_DEF_MESSAGE } from '../../logger';
import { BootstrapException } from '../bootstrap.exception';

export class InvalidComponentDefException extends BootstrapException {
  constructor(type: TComponent, componentName: string, message: string) {
    super(
      "ComponentParsing",
      INVALID_COMPONENT_DEF_MESSAGE(type, componentName, message)
    );
  }
}
