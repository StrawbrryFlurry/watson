import { ReceiverDef } from '@watsonjs/common';

import { RouteRef } from '..';
import { InstanceWrapper } from '../../injector';

export interface ContextCreatorArguments<T = any> {
  route: RouteRef;
  receiver: InstanceWrapper<ReceiverDef>;
  moduleKey: string;
  metadata: T[];
}
