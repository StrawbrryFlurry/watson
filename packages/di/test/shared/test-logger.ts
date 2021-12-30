import { InjectorInquirerContext, REQUESTED_BY_INJECTOR } from '@di/core/inquirer-context';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime } from '@di/providers/injection-token';

@Injectable({ lifetime: InjectorLifetime.Transient })
export class TestLogger {
  public name: string;

  constructor(inquirerCtx: InjectorInquirerContext) {
    const { inquirer } = inquirerCtx;

    if (inquirer === REQUESTED_BY_INJECTOR) {
      this.name = "[GLOBAL]";
    } else {
      this.name = inquirer.name;
    }
  }
}
