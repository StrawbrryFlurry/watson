import { WatsonModule } from '@di/decorators/module.decorator';

import { ContextComponent } from './context.component';

@WatsonModule({
  components: [ContextComponent],
})
export class ContextModule {}
