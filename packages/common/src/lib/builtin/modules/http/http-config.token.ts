import { InjectionToken } from "@watsonjs/di";

export const HTTP_CONFIG = new InjectionToken("HTTP client configuration", {
  providedIn: "root",
});
