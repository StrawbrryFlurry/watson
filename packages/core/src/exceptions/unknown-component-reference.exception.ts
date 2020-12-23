import { BootstrappingException } from './bootstrapping.exception';

export class UnknownComponentReferenceException extends BootstrappingException {
  constructor(context: string, componentName: string, module: string) {
    super(
      context,
      `Watson was not able to find a constructable type for the component ${componentName} in module ${module}`
    );
  }
}
