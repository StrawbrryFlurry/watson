import iterate from 'iterare';

import { IInstanceType } from '../interfaces';
import { WatsonContainer } from '../watson-container';
import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

export interface IInstanceData {
  type: IInstanceType;
  wrapper: InstanceWrapper;
  host: Module;
}

/**
 * Keeps the instances of all providers and receviers of modules in a globla context.
 */
export class GlobalInstanceHost {
  private instanceMap = new Map<string, IInstanceData[]>();
  private container: WatsonContainer;

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  getAllInstancesOfType(type: IInstanceType) {
    return (
      iterate(this.instanceMap)
        .filter(([name, instanceData]) =>
          instanceData.some((data) => data.type === type)
        )
        .map(([string, instanceData]) => instanceData)
        .reduce(
          (instances: IInstanceData[], instanceDataArr) => [
            ...instances,
            ...instanceDataArr,
          ],
          []
        )
        .filter((instanceData) => instanceData.type === type) || []
    );
  }

  getInstance(name: string, type?: IInstanceType) {
    if (typeof type === "undefined") {
      if (this.instanceMap.has(name)) {
        return this.instanceMap.get(name)[-1];
      }

      return undefined;
    }

    if (!this.instanceMap.has(name)) {
      return undefined;
    }

    const instanceData = this.instanceMap.get(name);
    return instanceData.find((instanceType) => instanceType.type === type);
  }

  applyInstances() {
    for (const [token, module] of this.container.getModules()) {
      const { providers, receivers } = module;

      for (const [name, wrapper] of providers) {
        this.addInstanceOfType(wrapper, "provider");
      }

      for (const [name, wrapper] of receivers) {
        console.log(wrapper);

        this.addInstanceOfType(wrapper, "receiver");
      }
    }
  }

  private addInstanceOfType(wrapper: InstanceWrapper, type: IInstanceType) {
    const { name } = wrapper;
    const instanceData = this.getInstance(name, type);

    if (typeof instanceData !== "undefined") {
      const data = this.instanceMap.get(name);
      data.push({
        type,
        wrapper,
        host: wrapper.host,
      });

      return this.instanceMap.set(name, data);
    }

    const data: IInstanceData[] = [
      {
        type,
        wrapper,
        host: wrapper.host,
      },
    ];

    this.instanceMap.set(name, data);
  }
}
