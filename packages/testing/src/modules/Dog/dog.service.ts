import { Injectable } from '@watson/common';

import { CatService } from '../Cat/cat.service';

@Injectable()
export class DogService {
  constructor(private readonly catService: CatService) {}
}
