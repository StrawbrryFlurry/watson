import { WatsonDynamicModule } from '@di/providers';

import { DynamicModuleComponent } from './dynamic-module.component';

export class DynamicModuleModule {
  static create(): WatsonDynamicModule {
    return {
      module: DynamicModuleModule,
      components: [DynamicModuleComponent],
    };
  }
}
