import { JS_COMMENT_REGEX } from "@di/constants";

const ARGUMENT_NAMES = /([^\s,]+)/g;

export function getFunctionParameters(func: Function): string[] {
  const functionWithComments = func.toString();
  const functionString = functionWithComments.replace(JS_COMMENT_REGEX, "");

  const parameters = functionString
    .slice(functionString.indexOf("(") + 1, functionString.indexOf(")"))
    .match(ARGUMENT_NAMES);

  return parameters ?? [];
}
