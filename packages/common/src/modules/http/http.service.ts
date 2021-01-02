import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';

import { Injectable } from '../../decorators';

export type HTTPBody = { [key: string]: any };

@Injectable()
export class HttpClient {
  private httpClientInstance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
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
}
