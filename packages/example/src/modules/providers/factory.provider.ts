import { FactoryProvider } from '@watsonjs/common';

export const exampleProviderFactory = async (valueProvider: string) =>
  new Promise((r) => setTimeout(() => r(valueProvider), 1000));

export const ExampleFactoryProvider: FactoryProvider = {
  provide: "EXAMPLE_FACTORY",
  useFactory: exampleProviderFactory,
  inject: ["EXAMPLE_VALUE"],
};
