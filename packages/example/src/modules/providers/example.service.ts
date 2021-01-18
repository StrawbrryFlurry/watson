import { HttpClient, Injectable } from '@watsonjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ExampleService {
  public readonly apiURI = "https://jsonplaceholder.typicode.com/todos/1";

  constructor(private http: HttpClient) {}

  public getData() {
    return this.http.get(this.apiURI).pipe(map((res) => res.data));
  }
}
