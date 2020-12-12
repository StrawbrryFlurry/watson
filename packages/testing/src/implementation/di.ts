import { MetadataResolver } from '@watson/core';

import { TestReceiver } from './test.receiver';

const resolver = new MetadataResolver();

let a = resolver.resolveConstructorParams(TestReceiver);
console.log(a);
