import { ContextInjector } from '@watsonjs/core';

export class MockContextFactory {
  static forEvent<T>(event: T) {
    return new ContextInjector();
  }

  static forCommand<T>(command: T) {
    return new ContextInjector();
  }

  static forInteraction<T>(interaction: T) {
    return new ContextInjector();
  }
}
