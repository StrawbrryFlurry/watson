import { WatsonModule } from '@di/decorators';

import { FooComponent } from './foo.component';

@WatsonModule({
  components: [FooComponent],
})
export class FooModule {}
