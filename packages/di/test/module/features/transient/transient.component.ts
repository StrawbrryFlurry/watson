import { WatsonComponent } from '@di/decorators';

import { TransientService } from './transient.service';

@WatsonComponent()
export class TransientComponent {
  constructor(private readonly _transientService: TransientService) {}
}
