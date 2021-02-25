import { CommandPrefix, Injectable } from '@watsonjs/common';
import { Message } from 'discord.js';

import { ExampleService } from '../providers/example.service';

@Injectable()
export class CommonPrefix implements CommandPrefix {
  constructor(private readonly db: ExampleService) {}

  getPrefix(message: Message) {
    return this.db.getData();
  }
}
