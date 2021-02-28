import { TReceiver } from '@watsonjs/common';

import { InstanceWrapper } from '../../injector';
import { AbstractRoute } from '../abstract-route';

export interface IContextCreatorArguments<T = any> {
  route: AbstractRoute;
  receiver: InstanceWrapper<TReceiver>;
  moduleKey: string;
  metadata: T[];
}
