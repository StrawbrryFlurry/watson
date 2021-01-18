import { Module } from '@watsonjs/common';

import { AskInquirableReceiver } from './ask-inquirable.receiver';
import { ReactInquirableReceiver } from './react-inquirable.receiver';

@Module({
  receivers: [AskInquirableReceiver, ReactInquirableReceiver],
})
export class InquirableExampleModule {}
