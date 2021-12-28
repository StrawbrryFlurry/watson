import { WatsonModule } from '@di/decorators';

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
