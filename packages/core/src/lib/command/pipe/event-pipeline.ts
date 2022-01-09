import { ContextBindingFactory, ContextProviderFactory } from '@core/di';
import { ContextType, EventCtx, EventPipeline, EventRoute } from '@watsonjs/common';
import { Injector } from '@watsonjs/di';
import { ClientEvents } from 'discord.js';

import { PipelineBaseImpl } from './pipeline-base';

export class EventPipelineImpl<
    E extends keyof ClientEvents,
    D extends ClientEvents[E] = ClientEvents[E]
  >
  extends PipelineBaseImpl<D>
  implements EventPipeline<E>
{
  constructor(routeRef: EventRoute, eventData: D) {
    super(routeRef, ContextType.event, eventData);
  }

  public static create(
    routeRef: EventRoute,
    injector: Injector,
    eventData: unknown[]
  ) {
    const pipeline = new EventPipelineImpl(routeRef, <any>eventData);
    pipeline.createExecutionContext(injector);
  }

  protected async createExecutionContext(moduleInj: Injector): Promise<void> {
    const inquirableFactory = new ContextProviderFactory(moduleInj);
    const bindingFactory: ContextBindingFactory = (bind) => {
      bind(EventCtx, { data: this.eventData });
      inquirableFactory.bindGlobals(this, bind);
    };

    await this.createAndBindInjector(moduleInj, bindingFactory);
  }
}
