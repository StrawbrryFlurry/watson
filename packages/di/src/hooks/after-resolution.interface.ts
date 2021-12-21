import { Injector } from "@di/core/injector";

export interface AfterResolution {
  afterResolution(injector: Injector): void;
}
