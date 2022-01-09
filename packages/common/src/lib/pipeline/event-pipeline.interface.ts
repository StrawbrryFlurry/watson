import { ClientEvents } from 'discord.js';

import { PipelineBase } from './pipeline-base.interface';

export interface EventPipeline<
  E extends keyof ClientEvents,
  D extends ClientEvents[E] = ClientEvents[E]
> extends PipelineBase {
  eventData: D;
}
