import { AxiosRequestConfig } from 'axios';

import { HttpClient } from './http.service';

export const httpClientFactory = (config?: AxiosRequestConfig) =>
  new HttpClient(config);
