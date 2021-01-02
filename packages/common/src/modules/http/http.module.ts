import { Module } from '../../decorators';
import { HttpClient } from './http.service';

@Module({
  providers: [HttpClient],
  exports: [HttpClient],
})
export class HttpModule {}
