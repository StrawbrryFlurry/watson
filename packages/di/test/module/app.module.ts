import { WatsonModule } from '@di/decorators/module.decorator';

import { ContextModule, DependsOnFooModule, DynamicModuleModule, TransientModule } from './features';

@WatsonModule({
  imports: [
    DependsOnFooModule,
    DynamicModuleModule.create(),
    TransientModule,
    ContextModule,
  ],
})
export class AppModule {}
