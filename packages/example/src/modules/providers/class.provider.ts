import { ClassProvider } from '@watsonjs/common';

export class ExampleProviderClass {
  public status = "Ready!";
}

export const ExampleClassProvider: ClassProvider = {
  provide: ExampleProviderClass,
  useClass: ExampleProviderClass,
};
