import { InjectionToken } from '@common/di';

export const HTTP_CONFIG = new InjectionToken("HTTP client configuration", {
  providedIn: "root",
});
