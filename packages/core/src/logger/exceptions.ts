import { green, red } from 'cli-color';

export const BOOTSTRAPPING_ERROR_MESSAGE = () =>
  red("An error occured during the bootstrapping process.");

export const SUGGESTION = (s: string) => "Possible fix: " + green(s);

export const EXCEPTION_STACK = (s: string) => red(s);
