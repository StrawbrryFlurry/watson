import { ExecutionContext, Filter, Injectable } from '@watsonjs/common';

@Injectable()
export class DirectMessageFilter implements Filter {
  filter(ctx: ExecutionContext) {
    return true;
  }
}
