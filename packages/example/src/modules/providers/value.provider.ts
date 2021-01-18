import { ValueProvider } from '@watsonjs/common';

const STATIC_VALUE = "STATIC_VALUE" as const;

export const ExampleValueProvider: ValueProvider = {
  provide: "EXAMPLE_VALUE",
  useValue: STATIC_VALUE,
};
