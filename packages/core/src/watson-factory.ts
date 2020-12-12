import { Type } from '@watson/common';

import { ApplicationConfig } from './application-config';
import { InstanceWrapper, Module } from './injector';
import { IWatsonApplicationOptions } from './interfaces';
import { WatsonApplication } from './watson-application';
import { WatsonContainer } from './watson-container';

export class WatsonApplicationFactory {
  public static async create(module: Type, options: IWatsonApplicationOptions) {
    const moduleWrapper = new InstanceWrapper(module);
    const _module = new Module(moduleWrapper);

    const appOptions = new ApplicationConfig();

    const container = new WatsonContainer(_module, appOptions);

    return new WatsonApplication(container);
  }
}
