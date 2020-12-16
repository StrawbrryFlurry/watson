import { Injectable } from '@watson/common';

import { DogService } from '../Dog/dog.service';

@Injectable()
export class CatService {
  constructor(private readonly dogService: DogService) {}
}
