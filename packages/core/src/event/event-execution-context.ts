import { ContextDataTypes, ExecutionContext } from '@watson/common';

export class EventExecutionContext<
  CtxData extends ContextDataTypes = ContextDataTypes
> implements ExecutionContext<any, any> {
  event: any;

  getEvent() {}
  getContextData() {}
  getType(): any {}
}
