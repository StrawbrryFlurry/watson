import { Injectable } from '@watsonjs/common';

@Injectable()
export class AppService {
  public ping() {
    return "Pong!";
  }
}
