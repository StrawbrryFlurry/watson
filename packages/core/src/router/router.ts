import { DIProvided } from '@watsonjs/common';
import { Observable } from 'rxjs';

/**
 *
 */
export class RouterRef<T = any> extends DIProvided({ providedIn: "module" }) {
  public events$: Observable<T>;

  constructor(events$: Observable<T>) {
    super();
    this.events$ = events$;
  }
}
