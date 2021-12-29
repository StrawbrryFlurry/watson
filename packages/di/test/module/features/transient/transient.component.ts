import { WatsonComponent } from '@di/decorators/component.decorator';

import { TransientService } from './transient.service';

@WatsonComponent()
export class TransientComponent {
  constructor(private readonly _transientService: TransientService) {}
}
