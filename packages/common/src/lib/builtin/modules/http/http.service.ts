import { Inject, Injectable } from '@watsonjs/di';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';

import { HTTP_CONFIG } from './http-config.token';

export type HTTPBody = { [key: string]: any };

export type HttpRequestInterceptor = (
  req: AxiosRequestConfig
) => AxiosRequestConfig;
export type HttpResponseInterceptor = (req: AxiosResponse) => AxiosResponse;

@Injectable()
export class HttpClient {
  private httpClientInstance: AxiosInstance;
  private requestInterceptors: HttpRequestInterceptor[] = [];
  private responseInterceptors: HttpResponseInterceptor[] = [];

  constructor(@Inject(HTTP_CONFIG) config: AxiosRequestConfig | undefined) {
    this.httpClientInstance = Axios.create(config);
  }

  public get<T extends Object = any>(
    uri: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return from(this.httpClientInstance.get<T>(uri, config));
  }

  public post<T extends Object = any>(
    uri: string,
    body?: HTTPBody,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return from(this.httpClientInstance.post<T>(uri, body, config));
  }

  public put<T extends Object = any>(
    uri: string,
    body?: HTTPBody,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return from(this.httpClientInstance.put<T>(uri, body, config));
  }

  public delete<T extends Object = any>(
    uri: string,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return from(this.httpClientInstance.delete<T>(uri, config));
  }

  public patch<T extends Object = any>(
    uri: string,
    body?: HTTPBody,
    config?: AxiosRequestConfig
  ): Observable<AxiosResponse<T>> {
    return from(this.httpClientInstance.patch<T>(uri, body, config));
  }

  public registerRequestInterceptor(interceptor: HttpRequestInterceptor) {}

  public registerResponseInterceptor(interceptor: HttpResponseInterceptor) {}

  protected handleInterceptors(type: "request" | "response") {}

  public async updateInstance(updateFn: (instance: AxiosInstance) => void) {
    await updateFn(this.httpClientInstance);
  }
}
