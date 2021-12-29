import { WatsonModule } from '@di/decorators/module.decorator';

import { TransientComponent } from './transient.component';
import { TransientService } from './transient.service';

@WatsonModule({
  components: [TransientComponent],
  providers: [TransientService],
})
export class TransientModule {}
