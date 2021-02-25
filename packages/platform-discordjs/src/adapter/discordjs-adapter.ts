import { WatsonEvent } from '@watsonjs/common';
import { AbstractDiscordAdapter } from '@watsonjs/core';
import { Observable } from 'rxjs';

export class DiscordJsAdapter extends AbstractDiscordAdapter {
  constructor() {}

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  initializeSlashCommands(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected setUserActivity(): void {
    throw new Error("Method not implemented.");
  }

  protected login(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected destroy(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public createListener<E extends WatsonEvent>(event: E): Observable<E> {
    throw new Error("Method not implemented.");
  }

  public createWSListener<T extends {}, E extends string>(
    event: E
  ): Observable<any> {
    throw new Error("Method not implemented.");
  }
}
