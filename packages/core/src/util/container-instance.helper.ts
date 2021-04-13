import { Type } from '@watsonjs/common';

import { BootstrappingException } from '../exceptions';
import { WatsonContainer } from '../watson-container';

/**
 * Retrieves an instance registered in root module.
 * If none is set it will create a new instance of the metatype.
 */
export async function containerInstanceHelper<T extends Type>(
  container: WatsonContainer,
  metatype: T
): Promise<InstanceType<T>> {
  const instance = container.getInstanceInRootModule(metatype);

  if (typeof instance !== "undefined" && (instance as T) instanceof metatype) {
    return instance;
  }

  const rootModule = container.getRootModule();
  const _instance = await rootModule.createInstanceOfType(metatype);

  if (typeof _instance === "undefined") {
    throw new BootstrappingException(
      "ContainerInstanceHelper",
      `Watson was not able to create an instance of ${metatype.name} in the context of the root module: ${rootModule.name}`
    );
  }

  return _instance;
}
