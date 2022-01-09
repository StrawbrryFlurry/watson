import { InjectionToken } from '@di/providers/injection-token';

import type { Injector } from "./injector";

export const INJECTOR = new InjectionToken<Injector>(
  "The current module injector for a given module.",
  {
    providedIn: "module",
  }
);
