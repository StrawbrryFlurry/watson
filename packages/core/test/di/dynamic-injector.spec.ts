import { Injectable, InjectorLifetime } from '@watsonjs/common';
import { Injector, uuid } from '@watsonjs/core';

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
class TransientProvided {
  public id: string;
  constructor() {
    this.id = uuid();
  }
}

describe("Dynamic Injector advanced dependency resolution", () => {
  test("Transient providers create a new instance every time.", async () => {
    const inj = Injector.create([TransientProvided], null, Injector.NULL);
    const a = await inj.get(TransientProvided);
    const b = await inj.get(TransientProvided);

    expect(a.id).not.toEqual(b);
  });
});
