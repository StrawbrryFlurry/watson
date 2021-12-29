import { WatsonModule } from '@di/decorators/module.decorator';

import { FooComponent } from './foo.component';

@WatsonModule({
  components: [FooComponent],
})
export class FooModule {}
