import { Module } from '../../decorators';
import { HTTPService } from './http.service';

@Module({
  providers: [HTTPService],
  exports: [HTTPService],
})
export class HTTPModule {}
