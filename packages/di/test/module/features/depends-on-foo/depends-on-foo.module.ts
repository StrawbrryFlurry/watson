import { WatsonModule } from '@di/decorators';

import { FooModule } from '../foo';
import { DependsOnFooComponent } from './depends-on-foo.component';

@WatsonModule({
  imports: [FooModule],
  components: [DependsOnFooComponent],
})
export class DependsOnFooModule {}
