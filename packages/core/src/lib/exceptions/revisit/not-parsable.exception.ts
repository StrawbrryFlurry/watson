import { ExecutionContext, RuntimeException } from '@watsonjs/common';

const NOT_PARSABLE_SUGGESTIONS = [
  "Refer to the docs for valid return types from Commands.",
];

export class NotParsableException extends RuntimeException {
  constructor(value: unknown, ctx: ExecutionContext) {
    const route = ctx.getRoute();
    const handlerName = route.handler.name;

    super(
      `Watson was not able to parse the returned value of ${handlerName} which was ${typeof value}`,
      NOT_PARSABLE_SUGGESTIONS
    );
  }
}
