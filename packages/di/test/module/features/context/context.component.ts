import { Inject, WatsonComponent } from '@di/decorators';
import { InjectionToken } from '@di/providers';

export const CONTEXT_PROVIDER = new InjectionToken<string>(
  "Some context provider",
  {
    providedIn: "ctx",
  }
);

@WatsonComponent()
export class ContextComponent {
  constructor(
    @Inject(CONTEXT_PROVIDER) private readonly _contextProvider: string
  ) {}
}
