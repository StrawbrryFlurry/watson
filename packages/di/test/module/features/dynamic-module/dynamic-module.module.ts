import { WatsonDynamicModule } from '@di/providers/dynamic-module.interface';

import { DynamicModuleComponent } from './dynamic-module.component';

export class DynamicModuleModule {
  static create(): WatsonDynamicModule {
    return {
      module: DynamicModuleModule,
      components: [DynamicModuleComponent],
    };
  }
}
