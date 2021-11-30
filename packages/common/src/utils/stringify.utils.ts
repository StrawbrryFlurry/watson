import { isNil } from './shared.utils';

export function stringify(token: any): string {
  if (typeof token === "string") {
    return token;
  }

  if (Array.isArray(token)) {
    return "[" + token.map(stringify).join(", ") + "]";
  }

  if (isNil(token)) {
    return "" + token;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const stringified = token.toString();

  if (isNil(stringified)) {
    return "" + stringified;
  }

  const newLineIndex = stringified.indexOf("\n");
  return newLineIndex === -1
    ? stringified
    : stringified.substring(0, newLineIndex);
}
